import UIKit
import Capacitor
import AVFoundation

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

  var window: UIWindow?

  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // Override point for customization after application launch.
    
    // Set up audio session for iOS
    do {
      try AVAudioSession.sharedInstance().setCategory(.playback,
                                                     mode: .default,
                                                     options: [.mixWithOthers, .allowBluetooth, .allowAirPlay])
      try AVAudioSession.sharedInstance().setActive(true)
      
      // Set the preferred sampling rate
      try AVAudioSession.sharedInstance().setPreferredSampleRate(44100.0)
      
      // Set the preferred I/O buffer duration (lower values mean less latency but more CPU)
      try AVAudioSession.sharedInstance().setPreferredIOBufferDuration(0.005) // 5ms buffer
      
      print("Audio session successfully configured")
    } catch {
      print("Failed to set audio session category: \(error)")
    }
    
    // Register for audio interruption notifications
    NotificationCenter.default.addObserver(self,
                                          selector: #selector(handleAudioSessionInterruption),
                                          name: AVAudioSession.interruptionNotification,
                                          object: nil)
    
    return true
  }
  
  @objc func handleAudioSessionInterruption(notification: Notification) {
    guard let userInfo = notification.userInfo,
          let typeValue = userInfo[AVAudioSessionInterruptionTypeKey] as? UInt,
          let type = AVAudioSession.InterruptionType(rawValue: typeValue) else {
      return
    }
    
    switch type {
    case .began:
      // Audio was interrupted (e.g., phone call)
      print("Audio session interrupted")
      
    case .ended:
      // Interruption ended
      guard let optionsValue = userInfo[AVAudioSessionInterruptionOptionKey] as? UInt else {
        return
      }
      
      let options = AVAudioSession.InterruptionOptions(rawValue: optionsValue)
      if options.contains(.shouldResume) {
        // Resume audio session
        try? AVAudioSession.sharedInstance().setActive(true)
        print("Audio session resumed")
        
        // Post a notification that can be caught by the web app to restart audio
        NotificationCenter.default.post(name: Notification.Name("AudioSessionResumed"), object: nil)
      }
      
    @unknown default:
      break
    }
  }

  func applicationWillResignActive(_ application: UIApplication) {
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
  }

  func applicationDidEnterBackground(_ application: UIApplication) {
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
  }

  func applicationWillEnterForeground(_ application: UIApplication) {
    // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
  }

  func applicationDidBecomeActive(_ application: UIApplication) {
    // Try reactivating the audio session when app becomes active
    do {
      try AVAudioSession.sharedInstance().setActive(true)
      print("Audio session reactivated")
    } catch {
      print("Failed to reactivate audio session: \(error)")
    }
    
    // Post a notification that can be caught by the web app
    NotificationCenter.default.post(name: Notification.Name("AudioSessionResumed"), object: nil)
  }

  func applicationWillTerminate(_ application: UIApplication) {
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
  }

  func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
    // Called when the app was launched with a url. Feel free to add additional processing here,
    // but if you want the App API to support tracking app url opens, make sure to keep this call
    return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
  }
  
  func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    // Called when the app was launched with an activity, including Universal Links.
    // Feel free to add additional processing here, but if you want the App API to support
    // tracking app url opens, make sure to keep this call
    return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
  }

}
