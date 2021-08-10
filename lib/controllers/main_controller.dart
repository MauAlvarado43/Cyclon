import 'package:cyclon/utils/cipher.dart';
import 'package:cyclon/utils/color_convertion.dart';
import 'package:cyclon/utils/constants.dart';
import 'package:cyclon/utils/geolocation.dart';
import 'package:cyclon/utils/http_handler.dart';
import 'package:cyclon/utils/message_manager.dart';
import 'package:cyclon/utils/styles.dart';
import 'package:cyclon/utils/size_config.dart';

import 'package:cyclon/pages/main_page.dart';

import 'package:flutter/material.dart';

import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';

import 'package:google_sign_in/google_sign_in.dart';
import 'package:permission_handler/permission_handler.dart';

import 'package:shared_preferences/shared_preferences.dart';

import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class MainPageState extends State<MainPage> with SingleTickerProviderStateMixin{

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      body: Container(
        child: Center(
          child: SingleChildScrollView(
            child: Column(
                children: [
                  SizedBox(height: SizeConfig.blockSizeVertical * 5),
                  Text("Cyclon", style: titleStyle),
                  SizedBox(height: SizeConfig.blockSizeVertical * 5),
                  Image.asset("assets/cyclon_mini.png", width: SizeConfig.blockSizeVertical * 30, height: SizeConfig.blockSizeVertical * 30),
                  SizedBox(height: SizeConfig.blockSizeVertical * 5),
                  SizedBox(
                    width: SizeConfig.blockSizeHorizontal * 73,
                    child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                            primary: ColorConvertion.fromHex(BTN_COLOR)
                        ),
                        onPressed: () {
                          Navigator.pushNamed(context, "/login");
                        },
                        child: SizedBox(
                            height: SizeConfig.blockSizeVertical * 5,
                            width: SizeConfig.blockSizeVertical * 40,
                            child: Row(
                                children: [
                                  Expanded(
                                      child: Center(
                                          child: Text(AppLocalizations.of(context).login)
                                      )
                                  )
                                ]
                            )
                        )
                    )
                  ),
                  SizedBox(
                    width: SizeConfig.blockSizeHorizontal * 73,
                    child: ElevatedButton(
                        onPressed: () async {

                          final LoginResult result = await FacebookAuth.instance.login(
                            permissions: ['email'],
                          );

                          if (result.status == LoginStatus.success) {

                            final graphResponse = await HttpHandler.getFacebookProfile(result.accessToken.token);

                            var geolocation = await determinePosition();

                            if(geolocation == null) {
                              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppLocalizations.of(context).geolocation_perm)));
                              await Future.delayed(Duration(seconds: 3), () async {await openAppSettings();});
                            }
                            else {

                              Map<String, dynamic> data = {
                                "email": encryptAPI(graphResponse["email"]),
                                "name": encryptAPI(graphResponse["first_name"]),
                                "last_name": encryptAPI(graphResponse["last_name"]),
                                "lat": encryptAPI(geolocation.latitude.toString()),
                                "lng": encryptAPI(geolocation.longitude.toString()),
                                "id": encryptAPI(graphResponse["id"])
                              };

                              var response = await HttpHandler.postRequest(IP + "/auth/mobile/facebook", data, {"Content-Type": "application/json"}, 20000);

                              if(response["code"] == 200) {

                                SharedPreferences prefs = await SharedPreferences.getInstance();

                                var _response = await HttpHandler.postRequestNotJson(IP + '/api/mobile/getUser', {
                                  "email": data["email"]
                                }, {"Content-Type": "application/json"}, 10000);

                                await prefs.setString('name', encryptAPI(_response.toString().split("/")[0]));
                                await prefs.setString('last_name', encryptAPI(_response.toString().split("/")[1]));
                                await prefs.setString('email', data["email"]);
                                await prefs.setString('password', data["id"]);
                                await prefs.setString('lat', data["lat"]);
                                await prefs.setString('lng', data["lng"]);
                                await prefs.setInt('type_login', 3);
                                await prefs.setBool('darkMode', false);
                                await prefs.setBool('notifications', true);

                                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppLocalizations.of(context).log_in)));

                                Navigator.of(context).pushReplacementNamed("/home");

                              }
                              else
                                MessageManager.getMessage(context, response["code"], response["msg"]);

                            }

                          }

                        },
                        child: SizedBox(
                            height: SizeConfig.blockSizeVertical * 5,
                            width: SizeConfig.blockSizeVertical * 40,
                            child: Row(
                                children: [
                                  SizedBox(
                                      width: SizeConfig.blockSizeHorizontal * 49,
                                      child: Text(AppLocalizations.of(context).login_fb)
                                  ),
                                  SizedBox(width: SizeConfig.blockSizeHorizontal * 8),
                                  Image.asset("assets/facebook_reverse.png", width: SizeConfig.blockSizeVertical * 4, height: SizeConfig.blockSizeVertical * 4)
                                ]
                            )
                        )
                    )
                  ),
                  SizedBox(
                    width: SizeConfig.blockSizeHorizontal * 73,
                    child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                            primary: Colors.white70
                        ),
                        onPressed: () async {

                          GoogleSignIn googleSignIn = GoogleSignIn(
                              scopes: [
                                'email',
                                'profile'
                              ]
                          );

                          GoogleSignInAccount googleSignInAccount = await googleSignIn.signIn();

                          if(await googleSignIn.isSignedIn()) {

                            var geolocation = await determinePosition();

                            if(geolocation == null) {
                              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppLocalizations.of(context).geolocation_perm)));
                              await Future.delayed(Duration(seconds: 3), () async {await openAppSettings();});
                            }
                            else {

                              Map<String, dynamic> data = {
                                "email": encryptAPI(googleSignInAccount.email),
                                "name": encryptAPI(googleSignInAccount.displayName.split(" ")[0]),
                                "last_name": encryptAPI(googleSignInAccount.displayName.split(" ")[1]),
                                "lat": encryptAPI(geolocation.latitude.toString()),
                                "lng": encryptAPI(geolocation.longitude.toString()),
                                "id": encryptAPI(googleSignInAccount.id)
                              };

                              var response = await HttpHandler.postRequest(IP + "/auth/mobile/google", data, {"Content-Type": "application/json"}, 1000);

                              print(response);

                              if(response["code"] == 200) {

                                SharedPreferences prefs = await SharedPreferences.getInstance();

                                var _response = await HttpHandler.postRequestNotJson(IP + '/api/mobile/getUser', {
                                  "email": data["email"]
                                }, {"Content-Type": "application/json"}, 10000);

                                await prefs.setString('name', encryptAPI(_response.toString().split("/")[0]));
                                await prefs.setString('last_name', encryptAPI(_response.toString().split("/")[1]));
                                await prefs.setString('email', data["email"]);
                                await prefs.setString('password', data["id"]);
                                await prefs.setString('lat', data["lat"]);
                                await prefs.setString('lng', data["lng"]);
                                await prefs.setInt('type_login', 2);
                                await prefs.setBool('darkMode', false);
                                await prefs.setBool('notifications', true);

                                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppLocalizations.of(context).log_in)));

                                Navigator.of(context).pushReplacementNamed("/home");

                              }
                              else
                                MessageManager.getMessage(context, response["code"], response["msg"]);

                            }

                          }

                        },
                        child: SizedBox(
                            height: SizeConfig.blockSizeVertical * 5,
                            width: SizeConfig.blockSizeVertical * 40,
                            child: Row(
                                children: [
                                  SizedBox(
                                      width: SizeConfig.blockSizeHorizontal * 49,
                                      child: Text(AppLocalizations.of(context).login_gl, style: TextStyle(color: Colors.black))
                                  ),
                                  SizedBox(width: SizeConfig.blockSizeHorizontal * 8),
                                  Image.asset("assets/google.png", width: SizeConfig.blockSizeVertical * 4, height: SizeConfig.blockSizeVertical * 4)
                                ]
                            )
                        )
                    )
                  ),
                  TextButton(
                      onPressed: () {
                        Navigator.pushNamed(context, "/register");
                      },
                      child: Text(AppLocalizations.of(context).has_account)
                  )
                ]
            )
          )
        )
      ),
    );

  }

  @override
  void initState() {
    super.initState();
  }

}