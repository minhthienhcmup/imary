//
//  BackupModuleHelper.swift
//  ImaryProject
//
//  Created by Ta  Quoc Cuong on 12/13/21.
//

import Foundation
import CloudKit
import RealmSwift
import AVFoundation
import Social
import Accounts

struct DocumentsDirectory {
  static let localDocumentsURL = FileManager.default.urls(for: FileManager.SearchPathDirectory.documentDirectory, in: .userDomainMask).last!
  static let iCloudDocumentsURL = FileManager.default.url(forUbiquityContainerIdentifier: nil)?.appendingPathComponent("Documents")
}

@objcMembers class BackupModuleHelper: NSObject{
  static let shared: BackupModuleHelper = BackupModuleHelper()
  
  func isCloudEnabled() -> Bool {
    if DocumentsDirectory.iCloudDocumentsURL != nil { return true }
    else { return false }
  }
  
  func backupServer(videosName: Array<String>) -> Bool {
    if(isCloudEnabled() == false)
    {
      print("Not avaible")
      return false
    }
    
    let fileManager = FileManager.default
    
    let iCloudDocumentsURL = FileManager.default.url(forUbiquityContainerIdentifier: nil)?.appendingPathComponent("Documents", isDirectory: true)
    
    let iCloudDocumentToCheckURL = iCloudDocumentsURL?.appendingPathComponent("default.realm", isDirectory: false)
    
    let tempURL = URL(fileURLWithPath: NSTemporaryDirectory(), isDirectory: true).appendingPathComponent("react-native-image-crop-picker")
    
    do {
      if let urls = try? fileManager.contentsOfDirectory(at: tempURL, includingPropertiesForKeys: nil, options: []) {
        for myURL in urls {
          if (myURL.pathExtension == "mp4" || myURL.pathExtension == "MP4") {
            let videoURL = iCloudDocumentsURL?.appendingPathComponent(myURL.lastPathComponent, isDirectory: false)
            if (fileManager.fileExists(atPath: videoURL?.path ?? "")) {
              try fileManager.removeItem(atPath: videoURL!.path)
            }
            try fileManager.copyItem(at: myURL, to: videoURL!)
          }
        }
      }
      
    } catch {
      print("\(error)")
      return false
    }
    let realmArchiveURL = iCloudDocumentToCheckURL
    let config = Realm.Configuration(
      // Set the new schema version. This must be greater than the previously used
      // version (if you've never set a schema version before, the version is 0).
      schemaVersion: 5,
      // Set the block which will be called automatically when opening a Realm with
      // a schema version lower than the one set above
      migrationBlock: { migration, oldSchemaVersion in
        // We haven’t migrated anything yet, so oldSchemaVersion == 0
        if (oldSchemaVersion < 1) {
          // Nothing to do!
          // Realm will automatically detect new properties and removed properties
          // And will update the schema on disk automatically
        }
      })
    
    // Tell Realm to use this new configuration object for the default Realm
    Realm.Configuration.defaultConfiguration = config
    do
    {
      if(fileManager.fileExists(atPath: realmArchiveURL?.path ?? ""))
      {
        try fileManager.removeItem(at: realmArchiveURL!)
        print("REPLACE")
        let realm = try! Realm()
        try! realm.writeCopy(toFile: realmArchiveURL!)
        return true
      }
      else
      {
        print("Need to store ")
        let realm = try! Realm()
        try realm.writeCopy(toFile: realmArchiveURL!)
        return true
      }
    }catch
    {
      print("ERR")
      return false
    }
  }
  
  func copyFileToLocal() -> Bool {
    if isCloudEnabled() {
      let fileManager = FileManager.default
      let enumerator = fileManager.enumerator(atPath: DocumentsDirectory.iCloudDocumentsURL!.path)
      let tempURL = URL(fileURLWithPath: NSTemporaryDirectory(), isDirectory: true).appendingPathComponent("react-native-image-crop-picker")
      if !fileManager.fileExists(atPath: tempURL.path) {
        do {
          try fileManager.createDirectory(atPath: tempURL.path, withIntermediateDirectories: true, attributes: nil)
        } catch {
          print(error.localizedDescription)
        }
      }
      while let file = enumerator?.nextObject() as? String {
        do {
          let cloudUrl = DocumentsDirectory.iCloudDocumentsURL!.appendingPathComponent(file)
          if (cloudUrl.pathExtension == "realm") {
            let path = Realm.Configuration.defaultConfiguration
            autoreleasepool {
              // all Realm usage here
            }
            _ = try Realm.deleteFiles(for: path)
            try fileManager.copyItem(at: cloudUrl, to: DocumentsDirectory.localDocumentsURL.appendingPathComponent(file))
          }
          else {
            let localUrl = tempURL.appendingPathComponent(file)
            if (fileManager.fileExists(atPath: localUrl.path)) {
              try fileManager.removeItem(at: localUrl)
            }
            try fileManager.copyItem(at: cloudUrl, to: localUrl)
          }
          print("\(file) Moved to local dir")
        } catch {
          print("Failed to move file to local dir : \(error)")
          return false
        }
        
      }
      return true;
    }
    return false;
  }
  
  func deleteFilesInPath(path: URL) {
    do {
      let fileURLs = try FileManager.default.contentsOfDirectory(at: path, includingPropertiesForKeys: nil, options: [])
      for fileURL in fileURLs {
        try FileManager.default.removeItem(at: fileURL)
      }
    }catch  { print(error) }
  }
  
  func DownloadDatabaseFromICloud() -> Bool
  {
    let fileManager = FileManager.default
    // Browse your icloud container to find the file you want
    if let icloudFolderURL = DocumentsDirectory.iCloudDocumentsURL,
       let urls = try? fileManager.contentsOfDirectory(at: icloudFolderURL, includingPropertiesForKeys: nil, options: []) {
      
      // Here select the file url you are interested in (for the exemple we take the first)
      for myURL in urls {
        // We have our url
        var lastPathComponent = myURL.lastPathComponent
        if lastPathComponent.contains(".icloud") {
          // This simple code launch the download
          do {
            try fileManager.startDownloadingUbiquitousItem(at: myURL)
          } catch {
            print("Unexpected error: \(error).")
          }
          lastPathComponent.removeFirst()
          let folderPath = myURL.deletingLastPathComponent().path
          let downloadedFilePath = folderPath + "/" + lastPathComponent.replacingOccurrences(of: ".icloud", with: "")
          var isDownloaded = false
          
          while !isDownloaded {
            // Check if the file is downloaded
            if fileManager.fileExists(atPath: downloadedFilePath) {
              isDownloaded = true
            }
          }
        }
      }
      return self.copyFileToLocal()
    }
    return false
  }
  
  func shareToSocial(content: String, imgPath: String, tags: String, resoure: String) {
  }
}
