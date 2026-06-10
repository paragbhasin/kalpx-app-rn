#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(KalpxLiveActivityModule, NSObject)

RCT_EXTERN_METHOD(
    startActivity:(NSString *)mantraName
    devanagari:(NSString *)devanagari
    params:(NSDictionary *)params
    resolve:(RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
    updateActivity:(NSDictionary *)params
    resolve:(RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
    completeChantActivity:(NSInteger)finalCount
    elapsedSeconds:(double)elapsedSeconds
    resolve:(RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
    startSankalpActivity:(NSString *)title
    line:(NSString *)line
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

@end
