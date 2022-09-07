export function findById(id, data) {
    for (let i in data) {
        if (!data[i])
            continue;
        if (data[i].id == id)
            return data[i];
    }
    return false;
}

