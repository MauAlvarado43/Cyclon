import 'dart:async';

import 'package:cyclon/utils/cipher.dart';
import 'package:cyclon/utils/constants.dart';
import 'package:cyclon/utils/http_handler.dart';
import 'package:cyclon/utils/message_manager.dart';
import 'package:cyclon/utils/regex_validation.dart';
import 'package:cyclon/utils/size_config.dart';
import 'package:cyclon/utils/styles.dart';
import 'package:flutter/material.dart';

import 'package:cyclon/pages/update_data_page.dart';

import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:shared_preferences/shared_preferences.dart';

class UpdateDataPageState extends State<UpdateDataPage> {

  TextEditingController name = TextEditingController();
  TextEditingController lastName = TextEditingController();
  TextEditingController email = TextEditingController();
  TextEditingController aPassword = TextEditingController();
  TextEditingController password = TextEditingController();
  TextEditingController cPassword = TextEditingController();

  GlobalKey<FormState> dataFormKey = GlobalKey<FormState>();
  GlobalKey<FormState> pwdFormKey = GlobalKey<FormState>();

  SharedPreferences prefs;

  int loginType = 0;

  @override
  void initState() {
    super.initState();

    Timer.run(() async {

      prefs = await SharedPreferences.getInstance();

      setState(() {

        name.text = decryptAPI(prefs.getString("name"));
        lastName.text = decryptAPI(prefs.getString("last_name"));

        loginType = prefs.getInt("type_login");

      });

    });

  }

  @override
  Widget build(BuildContext _context) {

    return Scaffold(
      body: Container(
        padding: EdgeInsets.all(SizeConfig.blockSizeVertical * 5),
        child: SingleChildScrollView(
            child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Form(
                      key: dataFormKey,
                      child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            (loginType == 1) ? SizedBox(height: SizeConfig.blockSizeVertical * 3) : SizedBox(height: SizeConfig.blockSizeVertical * 18),
                            Center(
                                child: Text(AppLocalizations.of(context).update_data, style: subtitleStyle)
                            ),
                            SizedBox(height: SizeConfig.blockSizeVertical * 5),
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
                            SizedBox(height: SizeConfig.blockSizeVertical * 5),
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
                              textInputAction: TextInputAction.done,
                            ),
                            SizedBox(height: SizeConfig.blockSizeVertical * 3),
                            Center(
                              child: SizedBox(
                                width: SizeConfig.blockSizeVertical * 42,
                                child: ElevatedButton(
                                    onPressed: () async {

                                      if(dataFormKey.currentState.validate()) {

                                        Map<String, dynamic> data = {
                                          "name": encryptAPI(name.text),
                                          "lastName": encryptAPI(lastName.text),
                                          "actualEmail": prefs.getString("email")
                                        };

                                        print(data);

                                        var response = await HttpHandler.postRequest(IP + '/api/mobile/updateInfo', data, {"Content-Type": "application/json"}, 5000);

                                        if(response["code"] == 200) {

                                          await prefs.setString('name', data["name"]);
                                          await prefs.setString('last_name', data["lastName"]);

                                          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppLocalizations.of(context).info_updated)));

                                        }
                                        else
                                          MessageManager.getMessage(context, response["code"], response["msg"]);

                                      }

                                    },
                                    child: Text(AppLocalizations.of(context).update)
                                )
                              ),
                            ),
                            SizedBox(height: SizeConfig.blockSizeVertical)
                          ]
                      )
                  ),
                  (loginType == 1) ? Divider() : SizedBox(),
                  (loginType == 1) ? Form(
                    key: pwdFormKey,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(height: SizeConfig.blockSizeVertical),
                        Center(
                            child: Text(AppLocalizations.of(context).update_password, style: subtitleStyle)
                        ),
                        SizedBox(height: SizeConfig.blockSizeVertical * 5),
                        Text(AppLocalizations.of(context).new_password),
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
                          obscureText: true,
                          controller: password,
                          textInputAction: TextInputAction.next,
                        ),
                        SizedBox(height: SizeConfig.blockSizeVertical * 5),
                        Text(AppLocalizations.of(context).confirm_new_password),
                        TextFormField(
                          validator: (value) {
                            if (value == null || value.isEmpty)
                              return AppLocalizations.of(context).c_password_enter;

                            if(cPassword.text != password.text)
                              return AppLocalizations.of(context).c_password_dont_match;

                            return null;
                          },
                          obscureText: true,
                          controller: cPassword,
                          textInputAction: TextInputAction.done,
                        ),
                        SizedBox(height: SizeConfig.blockSizeVertical * 3),
                        Center(
                          child: SizedBox(
                            width: SizeConfig.blockSizeVertical * 42,
                            child: ElevatedButton(
                                onPressed: () async {

                                  if(pwdFormKey.currentState.validate()) {

                                    await showDialog(
                                        context: context,
                                        barrierDismissible: true,
                                        builder: (BuildContext context) {

                                          var pwdCurrentKey = GlobalKey<FormState>();

                                          return AlertDialog(
                                              title: Text(AppLocalizations.of(context).validate_password),
                                              content: Column(
                                                  mainAxisSize: MainAxisSize.min,
                                                  children: [
                                                    Form(
                                                        key: pwdCurrentKey,
                                                        child: TextFormField(
                                                          controller: aPassword,
                                                          obscureText: true,
                                                          validator: (value) {

                                                            if (value.isEmpty)
                                                              return AppLocalizations.of(context).validate_password;

                                                            if(prefs.getString("password") != encryptAPI(value))
                                                              return AppLocalizations.of(context).password_incorrect;

                                                            return null;
                                                          },
                                                        )
                                                    ),
                                                    SizedBox(height: SizeConfig.blockSizeVertical * 3),
                                                    Row(
                                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                        children: [
                                                          ElevatedButton(
                                                              style: ElevatedButton.styleFrom(primary: Colors.redAccent),
                                                              child: Text(AppLocalizations.of(context).cancel),
                                                              onPressed: () {
                                                                Navigator.of(context).pop();
                                                              }
                                                          ),
                                                          ElevatedButton(
                                                              child: Text(AppLocalizations.of(context).continue_),
                                                              onPressed: () async {

                                                                if(pwdCurrentKey.currentState.validate()) {

                                                                  Map<String, dynamic> data = {
                                                                    "email": prefs.getString("email"),
                                                                    "password": encryptAPI(password.text)
                                                                  };

                                                                  var response = await HttpHandler.postRequest(IP + '/api/mobile/updatePassword', data, {"Content-Type": "application/json"}, 5000);

                                                                  if(response["code"] == 200) {

                                                                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppLocalizations.of(context).password_updated)));

                                                                    Navigator.of(context).pop();

                                                                    await Future.delayed(Duration(seconds: 4), () async {

                                                                      SharedPreferences prefs = await SharedPreferences.getInstance();
                                                                      await prefs.clear();

                                                                      Navigator.of(_context).pushReplacementNamed("/main");

                                                                    });

                                                                  }

                                                                  else
                                                                    MessageManager.getMessage(context, response["code"], response["msg"]);

                                                                }

                                                              }
                                                          )
                                                        ]
                                                    )
                                                  ]
                                              )
                                          );
                                        }
                                    );

                                  }

                                },
                                child: Text(AppLocalizations.of(context).update)
                            )
                          )
                        )
                      ]
                    )
                  ) : SizedBox()
                ]
            )
        )
      )
    );

  }

}