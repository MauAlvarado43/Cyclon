final email = RegExp(r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)$");
final word = RegExp(r"^([A-Za-zÁÉÍÓÚáéíóú\\xF1\\xD1]*(\s)?[A-Za-zÁÉÍÓÚáéíóú\\xF1\\xD1]+)*$");

bool checkEmail(String _email) {
  return email.hasMatch(_email);
}

bool checkWords(String text) {
  return word.hasMatch(text);
}

bool checkLength(String text) {
  return text.length <= 50;
}

// public static string replaceSpaces(string text) { return Regex.Replace(text, @"\s+", " "); }