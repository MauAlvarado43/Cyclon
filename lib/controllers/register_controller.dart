import 'package:cyclon/pages/register_page.dart';
import 'package:cyclon/utils/cipher.dart';
import 'package:cyclon/utils/constants.dart';
import 'package:cyclon/utils/geolocation.dart';
import 'package:cyclon/utils/http_handler.dart';
import 'package:cyclon/utils/message_manager.dart';
import 'package:cyclon/utils/regex_validation.dart';
import 'package:cyclon/utils/size_config.dart';

import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import 'package:cyclon/utils/styles.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';

class RegisterPageState extends State<RegisterPage> {

  TextEditingController name = TextEditingController();
  TextEditingController lastName = TextEditingController();
  TextEditingController email = TextEditingController();
  TextEditingController password = TextEditingController();
  TextEditingController cPassword = TextEditingController();
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
                        SizedBox(height: SizeConfig.blockSizeVertical * 5),
                        Center(
                            child: Text(AppLocalizations.of(context).register_in_cyclon, style: subtitleStyle)
                        ),
                        SizedBox(height: SizeConfig.blockSizeVertical * 7),
                        Text(AppLocalizations.of(context).name),
                        TextFormField(
                          validator: (value) {
                            if (value == null || value.isEmpty)
                              return AppLocalizations.of(context).name_enter;

                            if(!checkLength(value))
                              return AppLocalizations.of(context).name_length;

                            if(!checkWords(value))
                              return AppLocalizations.of(context).name_invalid;

                            return null;
                          },
                          controller: name,
                          textInputAction: TextInputAction.next,
                        ),
                        SizedBox(height: SizeConfig.blockSizeVertical * 7),
                        Text(AppLocalizations.of(context).last_name),
                        TextFormField(
                          validator: (value) {
                            if (value == null || value.isEmpty)
                              return AppLocalizations.of(context).last_name_enter;

                            if(!checkLength(value))
                              return AppLocalizations.of(context).last_name_length;

                            if(!checkWords(value))
                              return AppLocalizations.of(context).last_name_length;

                            return null;
                          },
                          controller: lastName,
                          textInputAction: TextInputAction.next,
                        ),
                        SizedBox(height: SizeConfig.blockSizeVertical * 7),
                        Text(AppLocalizations.of(context).email),
                        TextFormField(
                          validator: (value) {
                            if (value == null || value.isEmpty)
                              return AppLocalizations.of(context).email_enter;

                            if(!checkLength(value))
                              return AppLocalizations.of(context).email_length;

                            if(!checkEmail(value))
                              return AppLocalizations.of(context).email_invalid;

                            return null;
                          },
                          controller: email,
                          textInputAction: TextInputAction.next,
                        ),
                        SizedBox(height: SizeConfig.blockSizeVertical * 7),
                        Text(AppLocalizations.of(context).password),
                        TextFormField(
                          validator: (value) {
                            if (value == null || value.isEmpty)
                              return AppLocalizations.of(context).password_enter;

                            if(!checkLength(value))
                              return AppLocalizations.of(context).password_length;

                            if(value.length < 8)
                              return AppLocalizations.of(context).password_short;

                            return null;
                          },
                          controller: password,
                          obscureText: true,
                          textInputAction: TextInputAction.next,
                        ),
                        SizedBox(height: SizeConfig.blockSizeVertical * 7),
                        Text(AppLocalizations.of(context).c_password),
                        TextFormField(
                          validator: (value) {
                            if (value == null || value.isEmpty)
                              return AppLocalizations.of(context).c_password_enter;

                            if(cPassword.text != password.text)
                              return AppLocalizations.of(context).c_password_dont_match;

                            return null;
                          },
                          controller: cPassword,
                          obscureText: true,
                          textInputAction: TextInputAction.done,
                        ),
                        SizedBox(height: SizeConfig.blockSizeVertical * 7),
                        Center(
                            child: ElevatedButton(onPressed: () async {

                              if(formKey.currentState.validate()) {

                                var geolocation = await determinePosition();

                                if(geolocation == null) {
                                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppLocalizations.of(context).geolocation_perm)));
                                  await Future.delayed(Duration(seconds: 3), () async {await openAppSettings();});
                                }
                                else {

                                  Map<String, dynamic> data = {
                                    "name": encryptAPI(name.text),
                                    "lastName": encryptAPI(lastName.text),
                                    "email": encryptAPI(email.text),
                                    "password": encryptAPI(password.text),
                                    "lat": encryptAPI(geolocation.latitude.toString()),
                                    "lng": encryptAPI(geolocation.longitude.toString())
                                  };

                                  var response = await HttpHandler.postRequest(IP + '/auth/mobile/register', data, {"Content-Type": "application/json"}, 5000);

                                  if(response["code"] == 200) {

                                    SharedPreferences prefs = await SharedPreferences.getInstance();

                                    await prefs.setString('name', data["name"]);
                                    await prefs.setString('last_name', data["lastName"]);
                                    await prefs.setString('email', data["email"]);
                                    await prefs.setString('password', data["password"]);
                                    await prefs.setString('lat', data["lat"]);
                                    await prefs.setString('lng', data["lng"]);
                                    await prefs.setInt('type_login', 1);
                                    await prefs.setBool('darkMode', false);
                                    await prefs.setBool('notifications', true);

                                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppLocalizations.of(context).sign_up)));

                                    Navigator.of(context).pushReplacementNamed("/home");

                                  }
                                  else
                                    MessageManager.getMessage(context, response["code"], response["msg"]);

                                }
                              }

                            }, child: Text(AppLocalizations.of(context).login))
                        ),
                        SizedBox(height: SizeConfig.blockSizeVertical * 5)
                      ]
                  )
              )
            )
        )
    );

  }

}