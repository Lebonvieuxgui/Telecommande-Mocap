export function findByName(name, data) {
    for (let i in data) {
        if (!data[i])
            continue;
        if (data[i].name == name)
            return data[i];
    }
    return false;
}
