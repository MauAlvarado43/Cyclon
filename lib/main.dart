import 'package:cyclon/pages/home_page.dart';
import 'package:cyclon/pages/login_page.dart';
import 'package:cyclon/pages/register_page.dart';
import 'package:cyclon/pages/update_data_page.dart';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'package:cyclon/utils/styles.dart';
import 'package:cyclon/utils/color_convertion.dart';

import 'package:cyclon/pages/main_page.dart';
import 'package:cyclon/pages/introduction_page.dart';

import 'package:flutter_facebook_auth/flutter_facebook_auth.dart';

import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

void main() {
  if (kIsWeb) {
    FacebookAuth.instance.webInitialize(
      appId: "",
      cookie: true,
      xfbml: true,
      version: "v11.0",
    );
  }

  runApp(App());
}

class App extends StatelessWidget {
  final Color color = ColorConvertion.fromHex(MAIN_COLOR);

  @override
  Widget build(BuildContext context) {
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle(
      statusBarColor: color,
    ));

    return MaterialApp(
        debugShowMaterialGrid: false,
        debugShowCheckedModeBanner: false,
        showSemanticsDebugger: false,
        localizationsDelegates: [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: [
          Locale('en', ''), // English, no country code
          Locale('es', ''), // Spanish, no country code
        ],
        title: "Cobrador App",
        home: Main(),
        routes: <String, WidgetBuilder>{
          "/introduction": (BuildContext context) => new IntroductionPage(),
          "/main": (BuildContext context) => new MainPage(),
          "/login": (BuildContext context) => new LoginPage(),
          "/register": (BuildContext context) => new RegisterPage(),
          "/home": (BuildContext context) => new HomePage(),
          "/update_data": (BuildContext context) => new UpdateDataPage()
        });
  }
}

class Main extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return IntroductionPage();
  }
}
