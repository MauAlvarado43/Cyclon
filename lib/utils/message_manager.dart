import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class MessageManager {

  static getMessage(BuildContext context, int code, dynamic message) {

    if (code == 400)
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppLocalizations.of(context).e_400)));

    if (code == 401) {

      print(message[0]);

      if(message[0] == "BAD_LOCATION") {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppLocalizations.of(context).bad_location)));
      }
      else if(message[0] == "EMAIL_TAKEN") {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppLocalizations.of(context).email_taken)));
      }
      else if(message[0] == "USER_NOT_EXIST") {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppLocalizations.of(context).user_not_exist)));
      }
      else if(message[0] == "INCORRECT_PASSWORD") {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppLocalizations.of(context).password_incorrect)));
      }
      else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppLocalizations.of(context).e_500)));
      }

    }

  }

}