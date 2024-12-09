import 'package:encrypt/encrypt.dart';

String _password = "";
String _iv = "";

String encryptAPI(String text) {
  final key = Key.fromBase64(_password);
  final iv = IV.fromBase64(_iv);

  final encrypter = Encrypter(AES(key, mode: AESMode.cbc));

  final encrypted = encrypter.encrypt(text, iv: iv);

  return encrypted.base64;
}

String decryptAPI(String encrypted) {
  final key = Key.fromBase64(_password);
  final iv = IV.fromBase64(_iv);

  final encrypter = Encrypter(AES(key, mode: AESMode.cbc));

  final decrypted = encrypter.decrypt(Encrypted.fromBase64(encrypted), iv: iv);

  return decrypted;
}
