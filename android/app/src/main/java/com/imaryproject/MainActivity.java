//package com.imaryproject;
//
//import android.app.Activity;
//import android.content.Context;
//import android.content.Intent;
//import android.util.Log;
//
//import androidx.activity.result.ActivityResult;
//import androidx.activity.result.ActivityResultCallback;
//import androidx.activity.result.ActivityResultLauncher;
//import androidx.activity.result.contract.ActivityResultContracts;
//import androidx.annotation.NonNull;
//
//import com.facebook.react.ReactActivity;
//import com.google.android.gms.auth.api.signin.GoogleSignIn;
//import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
//import com.google.android.gms.auth.api.signin.GoogleSignInClient;
//import com.google.android.gms.common.api.ApiException;
//import com.google.android.gms.tasks.OnCompleteListener;
//import com.google.android.gms.tasks.OnFailureListener;
//import com.google.android.gms.tasks.OnSuccessListener;
//import com.google.android.gms.tasks.Task;
//import com.google.api.client.auth.oauth2.Credential;
//import com.google.api.client.extensions.android.http.AndroidHttp;
//import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
//import com.google.api.client.googleapis.extensions.android.gms.auth.GoogleAccountCredential;
//import com.google.api.client.http.HttpTransport;
//import com.google.api.client.http.javanet.NetHttpTransport;
//import com.google.api.client.json.gson.GsonFactory;
//import com.google.api.services.drive.Drive;
//import com.google.api.services.drive.DriveScopes;
//
//import java.util.Collections;
//import java.util.function.Function;
//
//import kotlin.Unit;
//import kotlin.jvm.functions.Function1;
//
//public class MainActivity extends ReactActivity {
//  private Context mContext = this;
//  private Drive googleDriveService;
//  private DriveServiceHelper driveHelper;
//  /**
//   * Returns the name of the main component registered from JavaScript. This is used to schedule
//   * rendering of the component.
//   */
//  @Override
//  protected String getMainComponentName() {
//    return "ImaryProject";
//  }
//
//  @Override
//  public void onActivityResult(int requestCode, int resultCode, Intent data) {
//
//
//    super.onActivityResult(requestCode, resultCode, data);
//    if (requestCode == BackupModule.RC_SIGN_IN) {
//      handleSignInResult(data);
//    }
//  }
//
//  private void handleSignInResult(Intent data) {
//    try {
//      HttpTransport transport = new NetHttpTransport();
//      GoogleSignIn.getSignedInAccountFromIntent(data).addOnSuccessListener(new OnSuccessListener<GoogleSignInAccount>() {
//        @Override
//        public void onSuccess(@NonNull GoogleSignInAccount googleSignInAccount) {
//          GoogleAccountCredential credential =
//                  GoogleAccountCredential.usingOAuth2(
//                          mContext, Collections.singleton(DriveScopes.DRIVE_FILE));
//          credential.setSelectedAccount(googleSignInAccount.getAccount());
//
//          googleDriveService =
//                  new com.google.api.services.drive.Drive.Builder(
//                          transport,
//                          new GsonFactory(),
//                          credential)
//                          .setApplicationName("Imary")
//                          .build();
//          if(googleDriveService != null){
//            driveHelper = new DriveServiceHelper(googleDriveService, new Function1<Boolean, Unit>() {
//              @Override
//              public Unit invoke(Boolean aBoolean) {
//                if(aBoolean){
//                  BackupModule.instance.getMCallBack().invoke(true);
//                }else{
//                  BackupModule.instance.getMCallBack().invoke(false);
//                }
//                return null;
//              }
//            });
//            driveHelper.clearFolder();
//          }
//        }
//      }). addOnFailureListener(new OnFailureListener() {
//        @Override
//        public void onFailure(@NonNull Exception e) {
//          Log.d("REGISTERED","failed: " +e.getMessage());
//        }
//      });
//    } catch (Exception e) {
//      // The ApiException status code indicates the detailed failure reason.
//      // Please refer to the GoogleSignInStatusCodes class reference for more information.
//      Log.d("TAG", "signInResult:failed code=" + e.getMessage());
//    }
//  }
//
//}
