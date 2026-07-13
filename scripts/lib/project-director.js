/**
 * STUDIO19.03 — фото-управляемая публикация (SMALL / LARGE / FULL)
 */
const { execSync } = require('child_process');

const ROOM_TYPES = [
  'Гостиная',
  'Кухня',
  'Спальня',
  'Ванная',
  'Прихожая',
  'Гардероб',
  'Кабинет',
  'Детская',
  'Терраса'
];

const DETAIL_SHOTS = { detail: 1, 'close-up': 1, material: 1 };

function fileNameFromUrl(url) {
  return ((url || '').split('/').pop() || '').toLowerCase();
}

function isLikelyFloorPlan(photo, total) {
  const fname = fileNameFromUrl(photo.url);
  if (/plan|план|layout|схем|planirov|чертеж|эскиз|floorplan/i.test(fname)) return true;
  if (photo.index >= total - 1 && DETAIL_SHOTS[photo.shot]) {
    if (/^1\.(jpe?g|png|webp)$/i.test(fname)) return true;
    if (/^plan/i.test(fname)) return true;
  }
  return false;
}

function materialPhotoScore(photo, total) {
  let score = 0;
  if (photo.shot === 'material') score += 40;
  if (photo.shot === 'detail') score += 30;
  if (photo.shot === 'close-up') score += 20;
  score += photo.area / 10000;
  if (photo.index >= total - 1) score -= 1000;
  if (photo.index >= total - 3) score -= 100;
  if (photo.index <= 1) score -= 20;
  return score;
}

function selectMaterialPhotos(photos, usedUrls, limit) {
  const max = limit || 2;
  const total = photos.length;
  const blocked = usedUrls || {};

  const candidates = photos.filter(function (p) {
    return !blocked[p.url] && !isLikelyFloorPlan(p, total);
  });

  let picked = candidates
    .filter(function (p) {
      return DETAIL_SHOTS[p.shot] || p.shot === 'material';
    })
    .sort(function (a, b) {
      return materialPhotoScore(b, total) - materialPhotoScore(a, total) || a.index - b.index;
    });

  if (picked.length < max) {
    const seen = {};
    picked.forEach(function (p) {
      seen[p.url] = true;
    });
    const fallback = candidates
      .filter(function (p) {
        return !seen[p.url] && p.index > 0 && p.index < total - 1;
      })
      .sort(function (a, b) {
        return materialPhotoScore(b, total) - materialPhotoScore(a, total) || b.area - a.area;
      });
    picked = picked.concat(fallback);
  }

  return picked.slice(0, max);
}

function imageSize(url) {
  try {
    const out = execSync(
      'curl -sL "' +
        url +
        '" -o /tmp/s1903-story.jpg && sips -g pixelWidth -g pixelHeight /tmp/s1903-story.jpg 2>/dev/null',
      { encoding: 'utf8', timeout: 60000 }
    );
    const w = parseInt((out.match(/pixelWidth:\s*(\d+)/) || [])[1], 10);
    const h = parseInt((out.match(/pixelHeight:\s*(\d+)/) || [])[1], 10);
    if (!w || !h) return null;
    return { w, h, ratio: w / h, area: w * h };
  } catch (e) {
    return null;
  }
}

function orientLabel(ratio) {
  if (ratio > 1.05) return 'landscape';
  if (ratio < 0.95) return 'portrait';
  return 'square';
}

function median(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function classifyShot(item, stats, index, total) {
  const r = item.ratio;
  const tail = index >= total * 0.68;

  if (item.orientation === 'landscape') {
    if (r >= 1.55) return 'wide';
    if (item.area >= stats.landMedian * 1.05) return 'emotional';
    if (r <= 1.12) return 'lifestyle';
    return 'room';
  }

  if (r < 0.72 || (tail && item.area <= stats.portMedian * 0.95)) return 'close-up';
  if (tail || item.area < stats.portMedian * 0.82) return 'detail';
  if (r > 1.02) return 'material';
  return 'room';
}

function isSimilar(a, b) {
  if (a.url === b.url) return true;
  const dr = Math.abs(a.ratio - b.ratio);
  const da = Math.abs(a.area - b.area) / Math.max(a.area, b.area);
  return dr < 0.02 && da < 0.05 && Math.abs(a.index - b.index) <= 1;
}

function classifyQuality(photo, allPhotos) {
  if (photo.shot === 'emotional' || photo.shot === 'wide') return 'primary';
  if (photo.shot === 'room' || photo.shot === 'lifestyle') return 'secondary';
  if (DETAIL_SHOTS[photo.shot]) return 'secondary';
  const repeat = allPhotos.some(function (p) {
    return p.url !== photo.url && Math.abs(p.index - photo.index) === 1 && isSimilar(p, photo);
  });
  return repeat ? 'repeat' : 'secondary';
}

function inferRoom(shot, index, total) {
  if (DETAIL_SHOTS[shot]) return 'Деталь';
  const segment = Math.floor((index / total) * ROOM_TYPES.length);
  return ROOM_TYPES[Math.min(segment, ROOM_TYPES.length - 1)];
}

function compositionMode(stats) {
  return stats.portraitPct > 70 ? 'vertical' : 'mixed';
}

function scoreHero(photos) {
  const eligible = photos.filter(function (p) {
    return !DETAIL_SHOTS[p.shot] && p.quality !== 'repeat';
  });
  return (
    eligible
      .slice()
      .sort(function (a, b) {
        function rank(x) {
          if (x.shot === 'emotional') return 100;
          if (x.shot === 'wide') return 95;
          if (x.shot === 'room') return 90;
          if (x.orientation === 'landscape') return 85;
          if (x.index <= 2) return 75;
          return 40;
        }
        return rank(b) - rank(a) || b.area - a.area || a.index - b.index;
      })[0] || photos[0]
  );
}

function isSimilarForCurate(a, b) {
  if (a.url === b.url) return true;
  const dr = Math.abs(a.ratio - b.ratio);
  const da = Math.abs(a.area - b.area) / Math.max(a.area, b.area);
  return dr < 0.02 && da < 0.05 && Math.abs(a.index - b.index) === 0;
}

function curatePhotos(photos, maxCount, heroUrl) {
  const sorted = photos
    .slice()
    .filter(function (p) {
      return p.url !== heroUrl && p.quality !== 'repeat';
    })
    .sort(function (a, b) {
      const tier = { primary: 3, secondary: 2, repeat: 0 };
      const qa = tier[a.quality] || 1;
      const qb = tier[b.quality] || 1;
      return qb - qa || b.area - a.area;
    });

  const picked = [];
  sorted.forEach(function (p) {
    if (picked.length >= maxCount) return;
    if (picked.some(function (q) {
      return isSimilarForCurate(p, q);
    }))
      return;
    picked.push(p);
  });
  return picked;
}

function orderByRoomDiversity(photos) {
  const out = [];
  const pool = photos.slice();
  let lastRoom = null;
  let sameRoomStreak = 0;

  while (pool.length) {
    let best = 0;
    let bestScore = -Infinity;
    for (let i = 0; i < pool.length; i += 1) {
      let score = pool[i].area;
      if (pool[i].quality === 'primary') score += 300000;
      if (pool[i].room !== lastRoom) score += 250000;
      if (DETAIL_SHOTS[pool[i].shot]) score += 80000;
      if (sameRoomStreak >= 2 && pool[i].room === lastRoom) score -= 500000;
      if (score > bestScore) {
        bestScore = score;
        best = i;
      }
    }
    const item = pool.splice(best, 1)[0];
    if (item.room === lastRoom) sameRoomStreak += 1;
    else sameRoomStreak = 1;
    lastRoom = item.room;
    out.push(item);
  }
  return out;
}

function rowOrientation(items) {
  if (!items.length) return 'portrait';
  if (items.length >= 2 && items.every(function (i) { return i.orientation === 'landscape'; })) {
    return 'landscape';
  }
  const o = items[0].orientation;
  if (o === 'square') return items.length > 1 && items[1].orientation === 'landscape' ? 'landscape' : 'portrait';
  return o;
}

function makeRow(composition, items, role) {
  const row = {
    composition: composition,
    orientation: rowOrientation(items),
    items: items
  };
  if (role) row.role = role;
  return row;
}

function pickFromPool(pool, state, opts) {
  const prefer = opts.prefer || 'any';
  const orient = opts.orientation || null;
  const excludeDetail = opts.excludeDetail;
  let best = -1;
  let bestScore = -Infinity;

  for (let i = 0; i < pool.length; i += 1) {
    const p = pool[i];
    if (state.used[p.url]) continue;
    if (excludeDetail && DETAIL_SHOTS[p.shot]) continue;
    if (orient && p.orientation !== orient && !(orient === 'portrait' && p.orientation === 'square')) continue;

    let score = p.area;
    if (prefer === 'detail' && DETAIL_SHOTS[p.shot]) score += 500000;
    if (prefer === 'room' && (p.shot === 'room' || p.shot === 'lifestyle')) score += 400000;
    if (prefer === 'emotional' && (p.shot === 'emotional' || p.shot === 'wide')) score += 450000;
    if (state.lastRoom && p.room === state.lastRoom) score -= state.sameRoomStreak >= 2 ? 400000 : 120000;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  if (best < 0) return null;
  const item = pool[best];
  state.used[item.url] = true;
  if (item.room === state.lastRoom) state.sameRoomStreak = (state.sameRoomStreak || 0) + 1;
  else {
    state.lastRoom = item.room;
    state.sameRoomStreak = 1;
  }
  return item;
}

function takeSmall(pool, state, mode, strict, allowDetail) {
  const forcedOrient = mode === 'vertical' ? 'portrait' : null;
  const first = pickFromPool(pool, state, {
    orientation: forcedOrient,
    excludeDetail: !allowDetail
  });
  if (!first) {
    if (strict) return null;
    const fallback = pickFromPool(pool, state, { orientation: forcedOrient });
    if (!fallback) return null;
    return makeRow('large', [fallback]);
  }
  const second = pickFromPool(pool, state, {
    orientation: forcedOrient || first.orientation,
    excludeDetail: !allowDetail
  });
  if (!second) {
    state.used[first.url] = false;
    if (state.lastRoom === first.room) state.sameRoomStreak = Math.max(0, (state.sameRoomStreak || 1) - 1);
    if (strict) return null;
    return makeRow('large', [first]);
  }
  return makeRow('small', [first, second]);
}

function takeLarge(pool, state, mode, prefer) {
  const forcedOrient = mode === 'vertical' ? 'portrait' : null;
  let item = pickFromPool(pool, state, {
    prefer: prefer || 'room',
    orientation: forcedOrient,
    excludeDetail: prefer !== 'detail'
  });
  if (!item) {
    item = pickFromPool(pool, state, { orientation: forcedOrient });
  }
  if (!item) return null;
  return makeRow('large', [item]);
}

function takeFull(pool, state, role) {
  const item = pickFromPool(pool, state, { prefer: 'emotional', excludeDetail: true });
  if (!item) return null;
  return makeRow('full', [item], role);
}

function takeIntroPair(pool, state, mode) {
  const forcedOrient = mode === 'vertical' ? 'portrait' : 'portrait';
  const first = pickFromPool(pool, state, { orientation: forcedOrient, excludeDetail: true });
  if (!first) return null;
  const second = pickFromPool(pool, state, {
    orientation: first.orientation,
    excludeDetail: true
  });
  if (!second) {
    state.used[first.url] = false;
    state.sameRoomStreak = 0;
    return null;
  }
  return [first, second];
}

function takeFullFinale(pool, state, mode) {
  let item = null;
  if (mode === 'mixed') {
    item = pickFromPool(pool, state, {
      prefer: 'emotional',
      orientation: 'landscape',
      excludeDetail: true
    });
    if (!item) {
      item = pickFromPool(pool, state, { orientation: 'landscape', excludeDetail: true });
    }
  }
  if (!item) {
    item = pickFromPool(pool, state, { prefer: 'emotional', excludeDetail: true });
  }
  if (!item) return null;
  return makeRow('full', [item], 'finale');
}

function takeLargeLandscape(pool, state, mode) {
  if (mode !== 'mixed') return takeLarge(pool, state, mode, 'room');
  let item = pickFromPool(pool, state, {
    orientation: 'landscape',
    excludeDetail: true,
    prefer: 'emotional'
  });
  if (!item) {
    item = pickFromPool(pool, state, { orientation: 'landscape', excludeDetail: true });
  }
  if (!item) return takeLarge(pool, state, mode, 'room');
  return makeRow('large', [item]);
}

function takeQuad(pool, state, mode) {
  const orient = 'portrait';
  const items = [];
  for (let i = 0; i < 4; i += 1) {
    const item = pickFromPool(pool, state, {
      orientation: orient,
      excludeDetail: true
    });
    if (!item) break;
    if (items.length && item.orientation !== items[0].orientation) {
      state.used[item.url] = false;
      break;
    }
    items.push(item);
  }
  if (items.length < 4) {
    items.forEach(function (it) {
      state.used[it.url] = false;
    });
    return null;
  }
  return makeRow('quad', items);
}

function takeAsymmetric(pool, state, mode) {
  if (mode !== 'mixed') return takeQuad(pool, state, mode);
  let small = pickFromPool(pool, state, { orientation: 'landscape', prefer: 'detail' });
  if (!small) {
    small = pickFromPool(pool, state, { orientation: 'landscape', excludeDetail: true });
  }
  if (!small) return null;
  const large = pickFromPool(pool, state, {
    orientation: 'landscape',
    excludeDetail: true,
    prefer: 'room'
  });
  if (!large) {
    state.used[small.url] = false;
    return null;
  }
  return makeRow('asymmetric', [small, large]);
}

function takeSmallPost(pool, state, mode) {
  return takeSmall(pool, state, mode, true, false);
}

function takeSmallReference(pool, state, mode) {
  let row = takeSmall(pool, state, mode, true, false);
  if (row) return row;
  if (mode === 'mixed') {
    row = takeSmall(pool, state, 'vertical', true, false);
  }
  return row || null;
}

function buildCompositionV6(pool, state, mode) {
  const sequence = [];

  // Screen 2: large opening portrait — room, not detail
  const large1 = takeLarge(pool, state, mode, 'room');
  if (large1) sequence.push(large1);

  // Screen 3: text block (renderer injects about.task + about.solution)
  sequence.push({ type: 'text' });

  // Screen 4: two portraits, different rooms
  const small1 = takeSmall(pool, state, mode, false, false);
  if (small1) sequence.push(small1);

  // Screen 5: second large — emotional room
  const large2 = takeLarge(pool, state, mode, 'room');
  if (large2) sequence.push(large2);

  // Screen 6: two more portraits
  const small2 = takeSmall(pool, state, mode, false, false);
  if (small2) sequence.push(small2);

  // Screen 7: editorial facts
  sequence.push({ type: 'editorial' });

  // Screen 8: large — detail or close-up preferred
  const large3 = takeLarge(pool, state, mode, 'detail');
  if (large3) sequence.push(large3);

  // Screen 9: two portraits (details allowed)
  const small3 = takeSmall(pool, state, mode, false, true);
  if (small3) sequence.push(small3);

  // Screen 10: full-width atmospheric (landscape or strongest remaining)
  const full1 = takeFullFinale(pool, state, mode);
  if (full1) sequence.push(full1);

  return sequence;
}

function buildCompositionV4(pool, state, mode) {
  const preSlots = [
    function () {
      return takeLargeLandscape(pool, state, mode);
    },
    function () {
      return takeQuad(pool, state, mode);
    },
    function () {
      return takeAsymmetric(pool, state, mode);
    },
    function () {
      return takeSmallReference(pool, state, mode);
    },
    function () {
      return takeLarge(pool, state, mode, 'detail');
    }
  ];
  const postSlots = [
    function () {
      return takeSmallPost(pool, state, mode);
    },
    function () {
      return takeLarge(pool, state, mode, 'room');
    }
  ];

  const pre = [];
  preSlots.forEach(function (slot) {
    const row = slot();
    if (row) pre.push(row);
  });

  const post = [];
  postSlots.forEach(function (slot) {
    const row = slot();
    if (row) post.push(row);
  });

  return { pre: pre, post: post };
}

function buildComposition(pool, allPhotos, heroUrl, mode) {
  const state = { used: {}, lastRoom: null, sameRoomStreak: 0 };
  const rows = [];

  const slots = [
    function () {
      return takeSmall(pool, state, mode);
    },
    function () {
      return takeLarge(pool, state, mode, 'room');
    },
    function () {
      return takeSmall(pool, state, mode);
    },
    function () {
      return takeLarge(pool, state, mode, 'detail');
    },
    function () {
      return takeSmall(pool, state, mode);
    },
    function () {
      return takeFull(pool, state, 'pause');
    },
    function () {
      return takeSmall(pool, state, mode);
    }
  ];

  slots.forEach(function (slot) {
    const row = slot();
    if (row) rows.push(row);
  });

  return rows;
}

function insertEditorialBlock(rows) {
  const sequence = [];
  let inserted = false;
  rows.forEach(function (row) {
    sequence.push(row);
    if (!inserted && row.composition === 'full' && row.role === 'pause') {
      sequence.push({ type: 'editorial' });
      inserted = true;
    }
  });
  if (!inserted) {
    const mid = Math.ceil(rows.length / 2);
    return rows.slice(0, mid).concat([{ type: 'editorial' }], rows.slice(mid));
  }
  return sequence;
}

function pickMaterials(photos, captions, usedUrls) {
  const mats = selectMaterialPhotos(photos, usedUrls, 4);
  if (mats.length < 2) return [];
  return mats.map(function (m, i) {
    return {
      image: m.url,
      caption: (captions && captions[i]) || '',
      orientation: m.orientation,
      w: m.w,
      h: m.h
    };
  });
}

function validateSequence(sequence, mode) {
  const photoRows = sequence.filter(function (r) {
    return r.composition && r.items && r.items.length;
  });
  let fixes = 0;

  photoRows.forEach(function (row) {
    if (row.composition === 'quad' && row.items.length >= 2) {
      const o0 = row.items[0].orientation;
      row.items.forEach(function (item) {
        if (item.orientation !== o0 && item.orientation !== 'square') fixes += 1;
      });
    }
    if (row.composition === 'asymmetric' && row.items.length === 2) {
      row.items.forEach(function (item) {
        if (item.orientation !== 'landscape') fixes += 1;
      });
    }
    if (row.composition === 'small' && row.items.length === 2) {
      const o0 = row.items[0].orientation;
      const o1 = row.items[1].orientation;
      if (o0 !== o1 && !(o0 === 'square' || o1 === 'square')) {
        row.composition = 'large';
        row.items = [row.items[0]];
        row.orientation = rowOrientation(row.items);
        fixes += 1;
      }
      const expected = mode === 'vertical' ? 'portrait' : row.orientation;
      row.items.forEach(function (item, idx) {
        if (mode === 'vertical' && item.orientation === 'landscape') {
          row.composition = 'large';
          row.items = [item];
          row.orientation = 'landscape';
          fixes += 1;
        }
        if (row.composition === 'small' && item.orientation !== expected && item.orientation !== 'square') {
          if (idx === 1) row.items.pop();
          else row.composition = 'large';
          fixes += 1;
        }
      });
    }
    if (row.composition === 'large' && row.items[0]) {
      row.orientation = row.items[0].orientation === 'landscape' ? 'landscape' : 'portrait';
    }
    if (row.composition === 'full' && row.items[0]) {
      row.orientation = rowOrientation(row.items);
    }
  });

  let streak = 0;
  let lastRoom = null;
  const flat = [];
  photoRows.forEach(function (row) {
    row.items.forEach(function (item) {
      flat.push(item);
    });
  });
  flat.forEach(function (item) {
    if (item.room === lastRoom) streak += 1;
    else streak = 1;
    lastRoom = item.room;
  });

  let smallStreak = 0;
  photoRows.forEach(function (row) {
    if (row.composition === 'small') {
      smallStreak += 1;
      if (smallStreak >= 3 && row.items[0] && DETAIL_SHOTS[row.items[0].shot] === undefined) {
        row.composition = 'large';
        fixes += 1;
        smallStreak = 0;
      }
    } else {
      smallStreak = 0;
    }
  });

  let largeStreak = 0;
  photoRows.forEach(function (row) {
    if (row.composition === 'large' || row.composition === 'full') {
      largeStreak += 1;
    } else {
      largeStreak = 0;
    }
    if (largeStreak >= 3) fixes += 1;
  });

  const seenUrls = {};
  photoRows.forEach(function (row) {
    row.items = row.items.filter(function (item) {
      if (seenUrls[item.url]) {
        fixes += 1;
        return false;
      }
      seenUrls[item.url] = true;
      return true;
    });
    if (row.composition === 'small' && row.items.length === 1) {
      row.composition = 'large';
      row.orientation = rowOrientation(row.items);
      fixes += 1;
    }
  });

  sequence = sequence.filter(function (row) {
    if (row.composition && (!row.items || !row.items.length)) {
      fixes += 1;
      return false;
    }
    return true;
  });

  return { sequence: sequence, fixes: fixes, roomStreak: streak };
}

function buildStats(photos) {
  const stats = {
    total: photos.length,
    landscape: 0,
    portrait: 0,
    square: 0,
    landMedian: median(
      photos.filter((p) => p.orientation === 'landscape').map((p) => p.area)
    ),
    portMedian: median(
      photos.filter((p) => p.orientation === 'portrait').map((p) => p.area)
    ),
    shotCounts: {},
    roomCounts: {}
  };

  photos.forEach(function (p) {
    stats[p.orientation] = (stats[p.orientation] || 0) + 1;
    stats.shotCounts[p.shot] = (stats.shotCounts[p.shot] || 0) + 1;
    if (p.room !== 'Деталь') stats.roomCounts[p.room] = (stats.roomCounts[p.room] || 0) + 1;
  });

  stats.landscapePct = (stats.landscape / stats.total) * 100;
  stats.portraitPct = (stats.portrait / stats.total) * 100;
  stats.detailCount = photos.filter((p) => DETAIL_SHOTS[p.shot]).length;
  return stats;
}

function serializeItem(item) {
  return {
    url: item.url,
    orientation: item.orientation,
    w: item.w,
    h: item.h,
    area: item.area,
    ratio: item.ratio,
    shot: item.shot,
    room: item.room,
    quality: item.quality,
    galleryIndex: item.galleryIndex != null ? item.galleryIndex : item.index
  };
}

function cachedDimsFromProject(project) {
  const map = {};
  const seq = (project.story && project.story.sequence) || [];
  seq.forEach(function (row) {
    (row.items || []).forEach(function (it) {
      if (it.url && it.w) map[it.url] = it;
    });
  });
  return map;
}

function classifyGallery(gallery, cache, skipProbe) {
  return gallery.map(function (url, index) {
    var size = null;
    if (skipProbe && cache[url] && cache[url].w) {
      size = cache[url];
    } else if (!skipProbe) {
      size = imageSize(url);
    }
    if (!size || !size.w) {
      size = { w: 1600, h: 2000, ratio: 0.8, area: 3200000 };
    }
    const ratio = size.ratio || size.w / size.h;
    return {
      url: url,
      index: index,
      w: size.w,
      h: size.h,
      ratio: ratio,
      area: size.area || size.w * size.h,
      orientation: orientLabel(ratio)
    };
  });
}

function analyzePhotos(project, options) {
  const skipProbe = options && options.skipProbe;
  const gallery = project.gallery && project.gallery.length ? project.gallery : [project.cover];
  const cache = cachedDimsFromProject(project);
  const photos = classifyGallery(gallery, cache, skipProbe);
  const stats = buildStats(photos);

  photos.forEach(function (p) {
    p.shot = classifyShot(p, stats, p.index, photos.length);
    p.room = inferRoom(p.shot, p.index, photos.length);
    p.quality = classifyQuality(p, photos);
  });

  return { photos: photos, stats: stats, mode: compositionMode(stats) };
}

function pickFinaleCandidate(pool, mode) {
  if (mode !== 'mixed') return null;
  const landscapes = pool
    .filter(function (p) {
      return p.orientation === 'landscape' && !DETAIL_SHOTS[p.shot];
    })
    .sort(function (a, b) {
      function score(x) {
        let s = x.area;
        if (x.shot === 'wide' || x.shot === 'emotional') s += 200000;
        if (/терраса/i.test(x.room)) s += 500000;
        if (x.index >= pool.length - 2) s += 100000;
        return s;
      }
      return score(b) - score(a) || b.index - a.index;
    });
  return landscapes[0] || null;
}

function reserveMaterialPhotos(photos, limit) {
  return selectMaterialPhotos(photos, {}, limit || 2);
}

function buildMaterialsFromReserve(reserved, captions) {
  if (reserved.length < 2) return [];
  return reserved.slice(0, 4).map(function (m, i) {
    return {
      image: m.url,
      caption: (captions && captions[i]) || '',
      orientation: m.orientation,
      w: m.w,
      h: m.h
    };
  });
}

function roomNarrative(room, shot) {
  const copy = {
    Гостиная: 'Рассеянный свет и низкая мебель — точка заземления.',
    Кухня: 'Камень и дерево без декоративного шума.',
    Спальня: 'Мягкий полумрак и натуральные фактуры.',
    Ванная: 'Спа-ритм: камень, дерево, рассеянный свет.',
    Прихожая: 'Спокойный вход — первое впечатление о доме.',
    Гардероб: 'Скрытое хранение и чистая геометрия.',
    Детская: 'Тёплый свет и мягкие природные оттенки.',
    Терраса: 'Граница города и тишины — финальный аккорд.',
    Деталь: 'Тактильная пауза — фактура в крупном плане.'
  };
  if (copy[room]) return copy[room];
  if (shot === 'detail' || shot === 'material') return 'Материал и фактура в фокусе.';
  return 'Свет, материал и пропорция в балансе.';
}

function laconicPhrase(room, shot, custom) {
  if (custom) return custom;
  const copy = {
    Гостиная: 'рассеянный свет и лён',
    Кухня: 'камень и дерево',
    Спальня: 'полумрак и натуральные фактуры',
    Ванная: 'камень и рассеянный свет',
    Прихожая: 'спокойный вход',
    Гардероб: 'чистая геометрия',
    Детская: 'тёплый свет и лён',
    Терраса: 'граница города и тишины',
    Деталь: 'фактура в крупном плане'
  };
  if (copy[room]) return copy[room];
  if (shot === 'detail' || shot === 'material') return 'материал и фактура';
  return 'свет и материал';
}

function titleOnlyCaption(room) {
  return { title: room || '' };
}

function largeCaption(it, ctx, customPhrase) {
  const room = it.room || 'Деталь';
  const cap = { title: room };
  if (ctx.largePhraseRooms[room]) return cap;
  const phrase = laconicPhrase(room, it.shot, customPhrase);
  if (phrase) {
    cap.text = phrase;
    ctx.largePhraseRooms[room] = true;
  }
  return cap;
}

function publicationBlockMetaV5(row, index, ed, ctx) {
  const custom = (ed.publicationBlocks && ed.publicationBlocks[index]) || {};

  if (row.type === 'intro') {
    return {
      label: custom.label || 'О проекте',
      itemCaptions: (row.items || []).map(function (it) {
        return titleOnlyCaption(it.room);
      })
    };
  }
  if (row.type === 'editorial') {
    return {};
  }
  if (row.type === 'materials') {
    return { label: custom.label || 'Материалы' };
  }

  const comp = row.composition;
  const items = row.items || [];
  const isLarge = comp === 'large' || comp === 'full';

  if (isLarge) {
    return {
      itemCaptions: items.map(function (it, i) {
        const itemCustom =
          custom.itemPhrases && custom.itemPhrases[i] ? custom.itemPhrases[i] : null;
        return largeCaption(it, ctx, itemCustom);
      })
    };
  }

  return {
    itemCaptions: items.map(function (it) {
      return titleOnlyCaption(it.room);
    })
  };
}

function publicationBlockMetaV4(row, index, ed) {
  const custom = (ed.publicationBlocks && ed.publicationBlocks[index]) || {};

  if (row.type === 'intro') {
    return {
      label: custom.label || 'О проекте',
      description: custom.description || '',
      itemCaptions: (row.items || []).map(function (it) {
        return { title: it.room, text: roomNarrative(it.room, it.shot) };
      })
    };
  }
  if (row.type === 'editorial') {
    return { label: custom.label || 'О проекте', description: custom.description || '' };
  }
  if (row.type === 'materials') {
    return {
      label: custom.label || 'Материалы и текстуры',
      description:
        custom.description || 'Тактильная палитра проекта — камень, дерево, лён.'
    };
  }

  const comp = row.composition;
  const items = row.items || [];

  if (comp === 'quad') {
    return {
      label: custom.label || 'По дому',
      description:
        custom.description || 'Четыре помещения в едином ритме света и материалов.',
      itemCaptions: items.map(function (it) {
        return { title: it.room, text: roomNarrative(it.room, it.shot) };
      })
    };
  }
  if (comp === 'asymmetric') {
    return {
      label: custom.label || 'Масштаб',
      description: custom.description || 'Контраст детали и пространства — журнальный ритм.',
      itemCaptions: items.map(function (it, i) {
        return {
          title: it.room,
          text: i === 0 ? roomNarrative('Деталь', it.shot) : roomNarrative(it.room, it.shot)
        };
      })
    };
  }
  if (comp === 'full') {
    const it = items[0] || {};
    return {
      label: custom.label || it.room || 'Финал',
      description:
        custom.description || roomNarrative(it.room, it.shot) || 'Эмоциональная точка истории.'
    };
  }
  if (items.length > 1) {
    return {
      label: custom.label || items.map(function (it) { return it.room; }).join(' · '),
      description: custom.description || 'Два кадра — одно настроение.',
      itemCaptions: items.map(function (it) {
        return { title: it.room, text: roomNarrative(it.room, it.shot) };
      })
    };
  }
  if (items.length === 1) {
    const it = items[0];
    return {
      label: custom.label || it.room,
      description: custom.description || roomNarrative(it.room, it.shot)
    };
  }
  return {};
}

function publicationBlockMeta(row, index, ed, version, ctx) {
  if (version >= 5) return publicationBlockMetaV5(row, index, ed, ctx);
  return publicationBlockMetaV4(row, index, ed);
}

function mapPublicationRow(row, index, ed, version, ctx) {
  const meta = publicationBlockMeta(row, index, ed, version, ctx);
  if (row.type) {
    const out = { type: row.type };
    if (row.items) out.items = row.items.map(serializeItem);
    if (meta.label) out.label = meta.label;
    if (meta.description) out.description = meta.description;
    if (meta.itemCaptions) out.itemCaptions = meta.itemCaptions;
    return out;
  }
  return {
    composition: row.composition,
    orientation: row.orientation,
    role: row.role || null,
    itemCaptions: meta.itemCaptions || null,
    items: (row.items || []).map(serializeItem)
  };
}

function directProjectPublication(project, editorial, options) {
  const ed = editorial[project.slug] || {};
  const analyzed = analyzePhotos(project, options);
  const photos = analyzed.photos;
  const stats = analyzed.stats;
  const mode = analyzed.mode;
  const hero = scoreHero(photos);
  const coverUrl = photos[0] && photos[0].url;
  const pool = orderByRoomDiversity(
    curatePhotos(photos, 14, hero.url).filter(function (p) {
      return p.url !== hero.url && p.url !== coverUrl;
    })
  );
  const state = { used: {}, lastRoom: null, sameRoomStreak: 0 };

  const sequence = buildCompositionV6(pool, state, mode);
  const validated = validateSequence(sequence, mode);
  const finalSequence = validated.sequence;

  const materialReserve = reserveMaterialPhotos(photos);
  const materials = buildMaterialsFromReserve(materialReserve, ed.materialCaptions || []);

  const publicationVersion = 6;

  return {
    compositionMode: mode,
    publicationVersion: publicationVersion,
    heroImage: hero.url,
    area: ed.area || project.area || null,
    materials: materials,
    story: {
      compositionMode: mode,
      publicationVersion: publicationVersion,
      sequence: finalSequence.map(function (row) {
        if (row.type) return { type: row.type };
        return {
          composition: row.composition,
          orientation: row.orientation,
          role: row.role || null,
          items: (row.items || []).map(serializeItem)
        };
      })
    }
  };
}

function directProject(project, editorial, options) {
  const ed = editorial[project.slug] || {};
  const analyzed = analyzePhotos(project, options);
  const photos = analyzed.photos;
  const stats = analyzed.stats;
  const mode = analyzed.mode;
  const hero = scoreHero(photos);
  const curated = orderByRoomDiversity(curatePhotos(photos, 15, hero.url));
  const layoutRows = buildComposition(curated.slice(), photos, hero.url, mode);
  let sequence = insertEditorialBlock(layoutRows);
  const validated = validateSequence(sequence, mode);
  sequence = validated.sequence;

  const usedUrls = { [hero.url]: true };
  sequence.forEach(function (row) {
    (row.items || []).forEach(function (it) {
      usedUrls[it.url] = true;
    });
  });

  const materials = pickMaterials(photos, ed.materialCaptions || [], usedUrls);
  if (materials.length >= 2) {
    sequence.push({ type: 'materials' });
  }

  return {
    compositionMode: mode,
    heroImage: hero.url,
    analysis: {
      stats: stats,
      mode: mode,
      photos: photos.map(function (p) {
        return {
          index: p.index + 1,
          orientation: p.orientation,
          room: p.room,
          shot: p.shot,
          quality: p.quality
        };
      })
    },
    materials: materials,
    story: {
      compositionMode: mode,
      sequence: sequence.map(function (row) {
        if (row.type) return row;
        return {
          composition: row.composition,
          orientation: row.orientation,
          role: row.role || null,
          items: (row.items || []).map(serializeItem)
        };
      })
    },
    validation: validated
  };
}

function formatAnalysisReport(directed, project) {
  const s = directed.analysis.stats;
  const lines = [
    '## ' + project.title,
    '',
    'Всего фотографий — ' + s.total,
    'Portrait — ' + s.portrait,
    'Landscape — ' + s.landscape,
    'Square — ' + s.square,
    '',
    'Режим композиции — **' + directed.compositionMode + '**',
    '',
    'Помещения:',
    Object.keys(s.roomCounts)
      .map(function (k) {
        return '- ' + k + ' — ' + s.roomCounts[k];
      })
      .join('\n'),
    '',
    'Деталей — ' + s.detailCount,
    '',
    'Последовательность:'
  ];

  directed.story.sequence.forEach(function (row, i) {
    if (row.type === 'intro') {
      const ids = (row.items || [])
        .map(function (it) {
          return '#' + (it.galleryIndex + 1) + ' ' + it.room;
        })
        .join(' + ');
      lines.push(i + 1 + '. INTRO — ' + ids);
      return;
    }
    if (row.type === 'editorial') {
      lines.push(i + 1 + '. EDITORIAL');
      return;
    }
    if (row.type === 'materials') {
      lines.push(i + 1 + '. MATERIALS');
      return;
    }
    if (!row.composition) return;
    const ids = (row.items || [])
      .map(function (it) {
        return '#' + (it.galleryIndex + 1) + ' ' + it.room;
      })
      .join(' + ');
    lines.push(
      i + 1 + '. ' + row.composition.toUpperCase() + (row.role ? ' (' + row.role + ')' : '') + ' — ' + ids
    );
  });

  return lines.join('\n');
}

module.exports = {
  directProject,
  directProjectPublication,
  analyzePhotos,
  formatAnalysisReport,
  validateSequence,
  compositionMode,
  classifyGallery,
  imageSize,
  scoreHero
};
