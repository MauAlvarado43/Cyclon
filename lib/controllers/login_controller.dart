import 'package:cyclon/pages/login_page.dart';
import 'package:cyclon/utils/cipher.dart';
import 'package:cyclon/utils/constants.dart';
import 'package:cyclon/utils/geolocation.dart';
import 'package:cyclon/utils/http_handler.dart';
import 'package:cyclon/utils/message_manager.dart';
import 'package:cyclon/utils/size_config.dart';

import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import 'package:cyclon/utils/styles.dart';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:permission_handler/permission_handler.dart';

class LoginPageState extends State<LoginPage> {

  TextEditingController email = TextEditingController();
  TextEditingController password = TextEditingController();
  GlobalKey<FormState> formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      body: Container(
        padding: EdgeInsets.all(SizeConfig.blockSizeVertical * 5),
        child: SingleChildScrollView(
          child: Form(
              key: formKey,
              child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(height: SizeConfig.blockSizeVertical * 17),
                    Center(
                        child: Text(AppLocalizations.of(context).login_in_cyclon, style: subtitleStyle)
                    ),
                    SizedBox(height: SizeConfig.blockSizeVertical * 10),
                    Text(AppLocalizations.of(context).email),
                    TextFormField(
                      validator: (value) {
                        if (value == null || value.isEmpty)
                          return AppLocalizations.of(context).email_enter;

                        return null;
                      },
                      controller: email,
                      textInputAction: TextInputAction.next,
                    ),
                    SizedBox(height: SizeConfig.blockSizeVertical * 10),
                    Text(AppLocalizations.of(context).password),
                    TextFormField(
                      validator: (value) {
                        if (value == null || value.isEmpty)
                          return AppLocalizations.of(context).password_enter;

                        return null;
                      },
                      controller: password,
                      obscureText: true,
                      textInputAction: TextInputAction.done,
                    ),
                    SizedBox(height: SizeConfig.blockSizeVertical * 10),
                    Center(
                        child: SizedBox(
                          width: SizeConfig.blockSizeVertical * 42,
                          child: ElevatedButton(onPressed: () async {

                            if(formKey.currentState.validate()) {

                              var data = {
                                "email": encryptAPI(email.text),
                                "password": encryptAPI(password.text)
                              };

                              var geolocation = await determinePosition();

                              if(geolocation == null) {
                                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppLocalizations.of(context).geolocation_perm)));
                                await Future.delayed(Duration(seconds: 3), () async {await openAppSettings();});
                              }
                              else {
                                var response = await HttpHandler.postRequest(IP + '/auth/mobile/login', data, {"Content-Type": "application/json"}, 5000);

                                if(response["code"] == 200) {

                                  SharedPreferences prefs = await SharedPreferences.getInstance();

                                  var _response = await HttpHandler.postRequestNotJson(IP + '/api/mobile/getUser', {
                                    "email": data["email"]
                                  }, {"Content-Type": "application/json"}, 10000);

                                  await prefs.setString('name', encryptAPI(_response.toString().split("/")[0]));
                                  await prefs.setString('last_name', encryptAPI(_response.toString().split("/")[1]));
                                  await prefs.setString('email', data["email"]);
                                  await prefs.setString('password', data["password"]);
                                  await prefs.setString('lat', geolocation.latitude.toString());
                                  await prefs.setString('lng', geolocation.longitude.toString());
                                  await prefs.setInt('type_login', 1);
                                  await prefs.setBool('darkMode', false);
                                  await prefs.setBool('notifications', true);

                                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppLocalizations.of(context).log_in)));

                                  Navigator.of(context).pushReplacementNamed("/home");

                                }
                                else
                                  MessageManager.getMessage(context, response["code"], response["msg"]);
                              }

                            }

                          }, child: Text(AppLocalizations.of(context).login))
                        )
                    )
                  ]
              )
          )
        )
      )
    );

  }


}