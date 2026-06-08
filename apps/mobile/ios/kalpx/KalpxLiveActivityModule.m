#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(KalpxLiveActivityModule, NSObject)

RCT_EXTERN_METHOD(
    startActivity:(NSString *)mantraName
    devanagari:(NSString *)devanagari
    counts:(NSDictionary *)counts
    resolve:(RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
    updateActivity:(NSDictionary *)counts
    resolve:(RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
    endActivity:(RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
    getPendingIncrements:(RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
    completeChantActivity:(NSInteger)finalCount
    elapsedSeconds:(NSInteger)elapsedSeconds
    resolve:(RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
    startSankalpActivity:(NSString *)title
    line:(NSString *)line
    resolve:(RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject
)

@end
