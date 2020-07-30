const checkEmail = (text) => (
    (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)$/).test(text)
)

const checkWords = (text) => (
    (/^([A-Za-zÁÉÍÓÚáéíóú\\xF1\\xD1]*(\s)?[A-Za-zÁÉÍÓÚáéíóú\\xF1\\xD1]+)?$/).test(text)
)

const checkDecimal = (text) => (
    (/^(\d|-)?(\d|,)*\.?\d{1,2}$/).test(text)
)

const replaceSpaces = (text) => (
    text.replace(/^(\s*)([\W\w]*)(\b\s*$)/g, '$2')
)