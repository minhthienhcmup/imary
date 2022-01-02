//
//  BackupModule.m
//  ImaryProject
//
//  Created by Ta Quoc Cuong on 12/13/21.
//

#import "BackupModule.h"
#import "AppDelegate.h"
#import <React/RCTLog.h>
#import "ImaryProject-Swift.h"
#import <Social/Social.h>
#import <Accounts/Accounts.h>

@implementation BackupModule{
  bool hasListeners;
}

// Will be called when this module's first listener is added.
-(void)startObserving {
  hasListeners = YES;
  // Set up any upstream listeners or background tasks as necessary
}

// Will be called when this module's last listener is removed, or on dealloc.
-(void)stopObserving {
  hasListeners = NO;
  // Remove upstream listeners, stop unnecessary background tasks
}

+ (id)allocWithZone:(NSZone *)zone {
  static BackupModule *sharedInstance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [super allocWithZone:zone];
  });
  return sharedInstance;
}

RCT_EXPORT_MODULE();

- (NSArray<NSString *> *)supportedEvents
{
  return @[];
}

RCT_EXPORT_METHOD(backupServer:(NSArray *)videosName
                  callback: (RCTResponseSenderBlock)callback)
{
  BOOL isSuccess = [[BackupModuleHelper shared]backupServerWithVideosName:videosName];
  callback(@[[NSNull null], @[@(isSuccess)]]);
}

RCT_EXPORT_METHOD(restoreServer:(NSString *)name
                  callback: (RCTResponseSenderBlock)callback)
{
  BOOL isSuccess = [[BackupModuleHelper shared]DownloadDatabaseFromICloud];
  callback(@[[NSNull null], @[@(isSuccess)]]);
}

RCT_EXPORT_METHOD(shareToFaceBook:(NSString *) msgContent imgPath:(NSString *)imgPath tags:(NSString *)tags) {
//  [[BackupModuleHelper shared] shareToSocialWithContent:@"" imgPath:@"" tags:@"" resoure:@""];
}

@end
