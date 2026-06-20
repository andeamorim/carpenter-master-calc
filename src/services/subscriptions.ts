/**
 * Subscription integration layer.
 *
 * For production, integrate RevenueCat (react-native-purchases) which handles
 * both App Store and Google Play billing with a single API.
 *
 * Setup steps:
 * 1. npm install react-native-purchases
 * 2. Create products in App Store Connect & Google Play Console
 * 3. Configure RevenueCat project and link store products
 * 4. Replace simulatePurchase() with Purchases.purchasePackage()
 */
import { PRODUCT_IDS, useSubscriptionStore } from '../store/subscription';

export async function initializePurchases(): Promise<void> {
  // import Purchases from 'react-native-purchases';
  // await Purchases.configure({ apiKey: Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY });
}

export async function purchaseMonthly(): Promise<boolean> {
  const productId =
    require('react-native').Platform.OS === 'ios'
      ? PRODUCT_IDS.ios
      : PRODUCT_IDS.android;

  // const offerings = await Purchases.getOfferings();
  // const result = await Purchases.purchasePackage(offerings.current!.monthly!);

  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + 1);
  useSubscriptionStore.getState().setSubscribed(true, expiry.toISOString());
  return true;
}

export async function restorePurchases(): Promise<boolean> {
  // const customerInfo = await Purchases.restorePurchases();
  // return customerInfo.entitlements.active['pro'] !== undefined;
  return useSubscriptionStore.getState().isSubscribed;
}