function decodeLatin1(str: string) {
    try {
        return decodeURIComponent(escape(str));
    } catch {
        return str;
    }
}

export default decodeLatin1;