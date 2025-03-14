export function validateMobileNumber(mobileNumber, toast) {
    const regex = /^\d{10}$/;
    if (!regex.test(mobileNumber)) {
        toast({ type: 'error', message: 'Invalid Number' })
    }
    return regex.test(mobileNumber);
}

export function validateEmailAddress(emailAddress , toast) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(emailAddress)) {
        toast({ type: 'error', message: 'Invalid Email' })
    }
    return regex.test(emailAddress);
}