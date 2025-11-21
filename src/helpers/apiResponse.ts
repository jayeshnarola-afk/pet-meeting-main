export const successCreated = (res: any, msg: string): void => {
    const dataRes = {
        status: 1,
        message: msg
    };
    return res.status(200).json(dataRes);
}

export const successResponse = (res: any, msg: string, data: any): void => {
    const dataRes = {
        status: 1,
        message: msg,
        data: data
    };
    return res.status(200).json(dataRes);
}

export const ErrorResponse = (res: any, msg: any): void => {
    const dataRes = {
        status: 0,
        message: msg,
    };
    return res.status(400).json(dataRes);
}

export const unauthorizedResponse = (res: any, msg: string): void => {
    const dataRes = {
        status: 0,
        message: msg,
    };
    return res.status(401).json(dataRes);
}

