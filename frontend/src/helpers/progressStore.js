const KEY = 'expleo-training-progress';

/* lecture  ➜ { "101": { chapters:[...], tabsCompleted:{...}, progress:70 }, … } */
export const loadProgress = () =>
  JSON.parse(localStorage.getItem(KEY) || '{}');

export const saveProgress = (trainingId, partial) => {
  const db = loadProgress();
  db[trainingId] = { ...(db[trainingId] || {}), ...partial };
  localStorage.setItem(KEY, JSON.stringify(db));
};