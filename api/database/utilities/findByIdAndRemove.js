
export function findByIdAndRemove(id, data) {
  for (let i in data) {
    if (!data[i]) {
      continue;
    }

    if (data[i].id === id) {
      delete data[i];
      return data;
    }
  }

  return false;
}
