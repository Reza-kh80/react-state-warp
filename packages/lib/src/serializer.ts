export const serializeData = async (data: any): Promise<{ cleaned: any; hasBinary: boolean }> => {
    let hasBinary = false;

    const process = async (value: any): Promise<any> => {
        if (value instanceof File || value instanceof Blob) {
            hasBinary = true;
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve({
                    __type: 'blob',
                    name: (value as File).name,
                    type: value.type,
                    content: reader.result
                });
                reader.readAsDataURL(value);
            });
        }

        if (Array.isArray(value)) {
            return Promise.all(value.map(process));
        }

        if (typeof value === 'object' && value !== null) {
            const result: any = {};
            const keys = Object.keys(value);
            for (const key of keys) {
                result[key] = await process(value[key]);
            }
            return result;
        }

        return value;
    };

    const cleaned = await process(data);
    return { cleaned, hasBinary };
};

export const deserializeData = (data: any): any => {
    if (data && typeof data === 'object') {
        if (data.__type === 'blob' && typeof data.content === 'string') {
            const byteString = atob(data.content.split(',')[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: data.type });
            if (data.name) {
                return new File([blob], data.name, { type: data.type });
            }
            return blob;
        }

        if (Array.isArray(data)) {
            return data.map(deserializeData);
        }

        const result: any = {};
        for (const key in data) {
            result[key] = deserializeData(data[key]);
        }
        return result;
    }
    return data;
};