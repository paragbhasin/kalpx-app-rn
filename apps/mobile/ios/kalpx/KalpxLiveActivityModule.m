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
    deepLinkURL:(NSString *)deepLinkURL
    anchorType:(NSString *)anchorType
    resolve:(RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
    startResetActivity:(NSString *)mantraTitle
    devanagari:(NSString *)devanagari
    resolve:(RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
    endResetActivity:(RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
    startRhythmActivity:(NSString *)band
    bandLabel:(NSString *)bandLabel
    anchorTitle:(NSString *)anchorTitle
    anchorType:(NSString *)anchorType
    anchorDevanagari:(NSString *)anchorDevanagari
    resolve:(RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
    updateRhythmActivity:(BOOL)bandDone
    resolve:(RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
    endRhythmActivity:(RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
    startInnerPathActivity:(NSInteger)dayNumber
    totalDays:(NSInteger)totalDays
    mantraTitle:(NSString *)mantraTitle
    mantraDevanagari:(NSString *)mantraDevanagari
    sankalpTitle:(NSString *)sankalpTitle
    practiceTitle:(NSString *)practiceTitle
    resolve:(RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
    updateInnerPathActivity:(BOOL)mantraDone
    sankalpDone:(BOOL)sankalpDone
    practiceDone:(BOOL)practiceDone
    resolve:(RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
    endInnerPathActivity:(RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject
)

@end
