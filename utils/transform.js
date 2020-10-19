const rawATMap = async i => {
  const t = {};
  t.h = 'at-map-medium';
  t.r = i.created_at.toString();
  t.summaryStats = i.summaryStats;
  return t;
};

const transformATMAp = async (records) => {
  console.log(`TRANSFORMING ${records.length} records`);
  return Promise.all(records.map(i => rawATMap(i)));
}

module.exports = {
  transformATMAp
};
