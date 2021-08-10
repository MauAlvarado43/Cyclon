import 'dart:async';
import 'package:http/http.dart' as http;
import 'dart:convert';

class HttpHandler {

  static Future<dynamic> getFacebookProfile(String token) async{
    try{
      var response = await http.get('https://graph.facebook.com/v2.12/me?fields=name,first_name,last_name,email&access_token=${token}');
      return jsonDecode(response.body);
    }
    catch (e) {
      return {
        "code": 400
      };
    }
  }

  static Future<dynamic> getRequest(Uri uri) async {
    try{
      http.Response response = await http.get(uri).timeout(Duration(seconds: 5),onTimeout: (){
        return null;
      });
      return json.decode(response.body);
    }
    catch (e) {
      return {
        "code": 400
      };
    }
  }

  static Future<dynamic> postRequest(String uri, Map<String, dynamic> body, Map<String, String> headers, int timeout) async {

    try{
      http.Response response = await http.post(uri, body: jsonEncode(body), headers: headers).timeout(Duration(seconds: timeout),onTimeout: (){
        return null;
      });

      return json.decode(response.body);
    }
    catch (e) {

      print(e);

      return {
        "code": 400
      };
    }
  }

  static Future<dynamic> postRequestNotJson(String uri, Map<String, dynamic> body, Map<String, String> headers, int timeout) async {

    try{
      http.Response response = await http.post(uri, body: jsonEncode(body), headers: headers).timeout(Duration(seconds: timeout),onTimeout: (){
        return null;
      });

      return response.body;
    }
    catch (e) {

      print(e);

      return {
        "code": 400
      };
    }
  }

}