'use strict';

var checkEmail = function checkEmail(text) {
    return (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)$/.test(text)
    );
};

var checkWords = function checkWords(text) {
    return (/^([A-Za-zÁÉÍÓÚáéíóú\\xF1\\xD1]*(\s)?[A-Za-zÁÉÍÓÚáéíóú\\xF1\\xD1]+)?$/.test(text)
    );
};

var checkDecimal = function checkDecimal(text) {
    return (/^(\d|-)?(\d|,)*\.?\d{1,2}$/.test(text)
    );
};

var replaceSpaces = function replaceSpaces(text) {
    return text.replace(/^(\s*)([\W\w]*)(\b\s*$)/g, '$2');
};
//# sourceMappingURL=regex.js.map