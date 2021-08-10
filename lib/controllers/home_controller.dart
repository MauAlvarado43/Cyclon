import 'dart:async';

import 'package:cyclon/pages/home_page.dart';

import 'package:cyclon/utils/cipher.dart';
import 'package:cyclon/utils/http_handler.dart';
import 'package:cyclon/utils/color_convertion.dart';
import 'package:cyclon/utils/constants.dart';
import 'package:cyclon/utils/geolocation.dart';
import 'package:cyclon/utils/message_manager.dart';
import 'package:cyclon/utils/size_config.dart';
import 'package:cyclon/utils/socket.dart';
import 'package:cyclon/utils/styles.dart';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import 'package:font_awesome_flutter/font_awesome_flutter.dart';

import 'package:flutter_gen/gen_l10n/app_localizations.dart';

import 'package:shared_preferences/shared_preferences.dart';

import 'package:webview_flutter/webview_flutter.dart';

import 'package:url_launcher/url_launcher.dart';


import 'dart:io';

class HomePageState extends State<HomePage> {

  bool receiveNotification = true;
  bool darkMode = false;
  String url = "www.google.com";
  int _selectedIndex = 0;
  WebViewController webController;
  List<Widget> _widgetOptions = <Widget>[
    Text(""),
    Text(""),
    Text("")
  ];

  void _onItemTapped(int index) async {
    setState(() {

      _selectedIndex = index;

      if(_selectedIndex == 0)
        webController.loadUrl(url);

      else if(_selectedIndex == 1)
        webController.loadUrl(IP + "/twitterMobile?dark=" + darkMode.toString());

    });
  }

  @override
  void initState() {
    super.initState();

    if (Platform.isAndroid)
      WebView.platform = SurfaceAndroidWebView();

    Timer.run(() async {

      SharedPreferences prefs = await SharedPreferences.getInstance();

      darkMode = prefs.getBool("darkMode");
      receiveNotification = prefs.getBool("notifications");

      var position = await determinePosition();

      setState(() {
        url = IP + "/mapMobile?lat=" + position.latitude.toString() + "&lng=" + position.longitude.toString();

        _widgetOptions = <Widget>[
          WebView(
              javascriptMode: JavascriptMode.unrestricted,
              initialUrl: url,
              onWebViewCreated: (WebViewController webViewController) {
                webController = webViewController;
              }
          ),
          WebView(
              javascriptMode: JavascriptMode.unrestricted,
              initialUrl: IP + "/twitterMobile?dark=" + darkMode.toString(),
              onWebViewCreated: (WebViewController webViewController) {
                webController = webViewController;
              }
          ),
          SingleChildScrollView(
            child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  SizedBox(
                      width: SizeConfig.blockSizeVertical * 42,
                      child: Text(AppLocalizations.of(context).your_data, style: labelSubTitleStyle)
                  ),
                  SizedBox(height: SizeConfig.blockSizeVertical * 3),
                  SizedBox(
                      width: SizeConfig.blockSizeVertical * 42,
                      child: ElevatedButton(
                          onPressed: () {
                            Navigator.of(context).pushNamed("/update_data");
                          },
                          child: Text(AppLocalizations.of(context).update_data)
                      )
                  ),
                  SizedBox(
                      width: SizeConfig.blockSizeVertical * 42,
                      child: ElevatedButton(
                          style: ElevatedButton.styleFrom(primary: ColorConvertion.fromHex(BTN_COLOR)),
                          onPressed: () async {

                            var geolocation = await determinePosition();

                            if(geolocation == null)
                              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppLocalizations.of(context).geolocation_perm)));

                            else {

                              SharedPreferences prefs = await SharedPreferences.getInstance();

                              var data = {
                                "email": prefs.getString("email"),
                                "lat": encryptAPI(geolocation.latitude.toString()),
                                "lng": encryptAPI(geolocation.longitude.toString())
                              };

                              await prefs.setString('lat', data["lat"]);
                              await prefs.setString('lng', data["lng"]);

                              var response = await HttpHandler.postRequest(IP + "/api/mobile/updateLocation", data, {"Content-Type": "application/json"}, 20000);

                              if(response["code"] == 200) {
                                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(AppLocalizations.of(context).success_location)));
                              }
                              else
                                MessageManager.getMessage(context, response["code"], response["msg"]);

                            }

                          },
                          child: Text(AppLocalizations.of(context).update_location)
                      )
                  ),
                  SizedBox(
                      width: SizeConfig.blockSizeVertical * 42,
                      child: ElevatedButton(
                          style: ElevatedButton.styleFrom(primary: Colors.blueAccent),
                          onPressed: () {
                            launch(IP + "/terms");
                          },
                          child: Text(AppLocalizations.of(context).terms)
                      )
                  ),
                  SizedBox(
                      width: SizeConfig.blockSizeVertical * 42,
                      child: ElevatedButton(
                          style: ElevatedButton.styleFrom(primary: Colors.blueAccent),
                          onPressed: () {
                            launch(IP + "/privacy");
                          },
                          child: Text(AppLocalizations.of(context).privacy)
                      )
                  ),
                  SizedBox(height: SizeConfig.blockSizeVertical * 3),
                  Divider(),
                  SizedBox(height: SizeConfig.blockSizeVertical * 3),
                  SizedBox(
                      width: SizeConfig.blockSizeVertical * 42,
                      child: Text(AppLocalizations.of(context).app_setting, style: labelSubTitleStyle)
                  ),
                  SizedBox(height: SizeConfig.blockSizeVertical * 3),
                  SizedBox(
                      width: SizeConfig.blockSizeVertical * 46,
                      child: StatefulBuilder(
                        builder: (BuildContext context, StateSetter stateSetter) {
                          return SwitchListTile(
                              value: receiveNotification,
                              title: Text(AppLocalizations.of(context).receive_notification),
                              onChanged: (bool value) {
                                stateSetter(() {

                                  receiveNotification = value;

                                  Timer.run(() async {
                                    SharedPreferences prefs = await SharedPreferences.getInstance();
                                    await prefs.setBool('notifications', receiveNotification);
                                  });

                                });
                              },
                              activeTrackColor: Colors.lightBlueAccent,
                              activeColor: Colors.lightBlue
                          );
                        },
                      )
                  ),
                  // SizedBox(
                  //     width: SizeConfig.blockSizeVertical * 46,
                  //     child: StatefulBuilder(
                  //       builder: (BuildContext context, StateSetter stateSetter) {
                  //         return SwitchListTile(
                  //             value: darkMode,
                  //             title: Text(AppLocalizations.of(context).dark_mode),
                  //             onChanged: (bool value) {
                  //               stateSetter(() {
                  //
                  //                 darkMode = value;
                  //
                  //                 Timer.run(() async {
                  //
                  //                   SharedPreferences prefs = await SharedPreferences.getInstance();
                  //                   await prefs.setBool('darkMode', darkMode);
                  //
                  //                 });
                  //
                  //               });
                  //             },
                  //             activeTrackColor: Colors.lightBlueAccent,
                  //             activeColor: Colors.lightBlue
                  //         );
                  //       },
                  //     )
                  // ),
                  SizedBox(height: SizeConfig.blockSizeVertical * 3),
                  Divider(),
                  SizedBox(height: SizeConfig.blockSizeVertical * 3),
                  SizedBox(
                      width: SizeConfig.blockSizeVertical * 42,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(primary: Colors.black54),
                        onPressed: () async {

                          SharedPreferences prefs = await SharedPreferences.getInstance();
                          await prefs.clear();

                          Navigator.of(context).pushReplacementNamed("/main");

                        },
                        child: Text(AppLocalizations.of(context).logout)
                      )
                  ),
                  SizedBox(height: SizeConfig.blockSizeVertical * 3),
                  SizedBox(
                      width: SizeConfig.blockSizeVertical * 42,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [Text("Cyclon v1.1")]
                      )
                  )
                ]
            )
          )
        ];

      });

    });

  }

  @override
  Widget build(BuildContext context) {

    CyclonSocket cyclonSocket = CyclonSocket();
    cyclonSocket.socketInit(context);

    return Scaffold(
      appBar: AppBar(
        toolbarHeight: SizeConfig.blockSizeVertical * 0,
      ),
      body: Center(
        child: _widgetOptions.elementAt(_selectedIndex),
      ),
      bottomNavigationBar: BottomNavigationBar(
        selectedItemColor: darkMode ? Colors.blue : Colors.blue,
        unselectedItemColor: darkMode ? Colors.grey : Colors.black54,
        backgroundColor: darkMode ? Colors.black : Colors.white,
        currentIndex: _selectedIndex, //// this will be set when a new tab is tapped
        items: [
          BottomNavigationBarItem(
            icon: new Icon(Icons.map_outlined),
            title: new Text(AppLocalizations.of(context).map),
          ),
          BottomNavigationBarItem(
            icon: new Icon(FaIcon(FontAwesomeIcons.twitter).icon),
            title: new Text(AppLocalizations.of(context).tweets),
          ),
          BottomNavigationBarItem(
              icon: Icon(Icons.settings),
              title: Text(AppLocalizations.of(context).settings)
          )
        ],
        onTap: _onItemTapped,
      )
    );

  }

}