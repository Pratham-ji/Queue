import crypto from 'crypto';

// Temporary in-memory store
// Replace with Redis later

const otpStore = new Map<string,{ hash: string; expiresAt: number; attempts: number }>();

/*
Structure:
otpStore.set(phone, {
  hash,
  expiresAt,
  attempts
})
*/

const otp_expire = 5 * 60 * 1000; // this is 5 min of time
const max_attempt = 5;// only 5 attempts are allowed 

export function generateOTP(phone: string) {
  // create otp 
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  //hash otp (into cipher code)
  const hash = crypto.createHash("sha256").update(otp).digest("hex");

  // store OTP securely
  otpStore.set(phone, { hash, expiresAt: Date.now() + otp_expire, attempts: 0 });

  return otp;

}

export function verifyOtp(phone:string ,otp:string){
  const record = otpStore.get(phone);

  if(!record){
    return {success : false,message :"OTP not found"};

  }

  //here otp expire
  if(Date.now()>record.expiresAt){
    otpStore.delete(phone);
    return {success : false,message :"OTP expired"};
  }

  //attempts count
  if(record.attempts >= max_attempt){
    otpStore.delete(phone);
    return {success : false,message :"Too many attempts"};
  }

  const incomingHash = crypto.createHash("sha256").update(otp).digest("hex");


  //wrong otp
  if(incomingHash != record.hash){
    record.attempts += 1;
    otpStore.set(phone,record);

    return {
      success: false,
      message: `Invalid OTP. Attempts Left:${max_attempt - record.attempts}`
    };
  }

  //found correct otp
  otpStore.delete(phone);
  return {success: true};

}