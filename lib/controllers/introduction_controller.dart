import 'dart:async';

import 'package:cyclon/utils/size_config.dart';

import 'package:flutter/material.dart';
import 'package:introduction_screen/introduction_screen.dart';

import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:cyclon/pages/introduction_page.dart';
import 'package:shared_preferences/shared_preferences.dart';

class IntroductionPageState extends State<IntroductionPage> {

  Future<bool> _isLogged;
  bool rendering = true;

  @override
  void initState() {
    super.initState();

    Timer.run(() async {

      bool logged = await isLogged();

      if(logged)
        Navigator.pushReplacementNamed(context, "/home");

      setState(() {
        rendering = false;
      });

    });

  }

  Future<bool> isLogged() async {

    SharedPreferences prefs = await SharedPreferences.getInstance();

    if(prefs.getString("email") != null)
      return true;

    return false;

  }

  @override
  Widget build(BuildContext context) {

    SizeConfig.init(context);
    print("V: " + SizeConfig.blockSizeVertical.toString());
    print("H: " + SizeConfig.blockSizeHorizontal.toString());

    List<PageViewModel> views = [
      PageViewModel(
          title: AppLocalizations.of(context).cyclon_exp,
          body: AppLocalizations.of(context).cyclon_exp_desc,
          image: Image.asset("assets/mobile.png", width: SizeConfig.blockSizeHorizontal * 50, height: SizeConfig.blockSizeHorizontal * 50)
      ),
      PageViewModel(
          title: AppLocalizations.of(context).cyclon_alerts,
          body: AppLocalizations.of(context).cyclon_alerts_desc,
          image: Image.asset("assets/alert.png", width: SizeConfig.blockSizeHorizontal * 50, height: SizeConfig.blockSizeHorizontal * 50)
      ),
      PageViewModel(
          title: AppLocalizations.of(context).cyclon_news,
          body: AppLocalizations.of(context).cyclon_news_desc,
          image: Image.asset("assets/social_media.png", width: SizeConfig.blockSizeHorizontal * 50, height: SizeConfig.blockSizeHorizontal * 50)
      )
    ];

    return (rendering) ? Scaffold() : IntroductionScreen(
        pages: views,
        skip: Icon(Icons.skip_next),
        next: Icon(Icons.navigate_next),
        done: Text(AppLocalizations.of(context).start),
        onDone: () {
          Navigator.of(context).pushReplacementNamed("/main");
        },
        onSkip: () {
          // You can also override onSkip callback
        }
    );

  }

}