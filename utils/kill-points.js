function kill (data) {
  return data.Items.map(({ points, ...rest }) => rest)
}
exports.kill = kill
