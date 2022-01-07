package com.imaryproject

import android.content.Context
import android.content.Intent
import android.util.Log
import com.facebook.react.ReactActivity
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.tasks.OnFailureListener
import com.google.android.gms.tasks.OnSuccessListener
import com.google.api.client.googleapis.extensions.android.gms.auth.GoogleAccountCredential
import com.google.api.client.http.HttpTransport
import com.google.api.client.http.javanet.NetHttpTransport
import com.google.api.client.json.gson.GsonFactory
import com.google.api.services.drive.Drive
import com.google.api.services.drive.DriveScopes
import kotlinx.coroutines.*
import java.lang.Exception

class MainActivity: ReactActivity() {
    private val mContext: Context = this
    private var googleDriveService: Drive? = null
    private var driveHelper: DriveServiceHelper? = null

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String? {
        return "ImaryProject"
    }
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == BackupModule.RC_UPLOAD) {
            handleSignInResult(data)
        }else if(requestCode == BackupModule.RC_RESTORE){
            handleRestore(data)
        }
    }

    private fun handleRestore(data: Intent?) {
        try {
            val transport: HttpTransport = NetHttpTransport()
            GoogleSignIn.getSignedInAccountFromIntent(data)
                .addOnSuccessListener { googleSignInAccount ->
                    GlobalScope.launch(Dispatchers.IO){
                        val credential = GoogleAccountCredential.usingOAuth2(
                            mContext, setOf(DriveScopes.DRIVE_FILE)
                        )
                        credential.selectedAccount = googleSignInAccount.account
                        googleDriveService = Drive.Builder(
                            transport,
                            GsonFactory(),
                            credential
                        )
                            .setApplicationName("Imary")
                            .build()
                        if (googleDriveService != null) {
                            driveHelper = DriveServiceHelper(googleDriveService!!) { aBoolean: Boolean ->
                                if (aBoolean) {
                                    BackupModule.instance.mCallBack!!.invoke(null, true)
                                } else {
                                    BackupModule.instance.mCallBack!!.invoke(null, false)
                                }
                            }
                            withContext(Dispatchers.Default){
                                driveHelper!!.restoreFile()
                            }
                        }
                    }
                }.addOnFailureListener { e -> Log.d("REGISTERED", "failed: " + e.message) }
        } catch (e: Exception) {
            // The ApiException status code indicates the detailed failure reason.
            // Please refer to the GoogleSignInStatusCodes class reference for more information.
            Log.d("TAG", "signInResult:failed code=" + e.message)
        }
    }

    private fun handleSignInResult(data: Intent?) {
        try {
            val transport: HttpTransport = NetHttpTransport()
            GoogleSignIn.getSignedInAccountFromIntent(data)
                .addOnSuccessListener { googleSignInAccount ->
                    GlobalScope.launch(Dispatchers.IO){
                        val credential = GoogleAccountCredential.usingOAuth2(
                            mContext, setOf(DriveScopes.DRIVE_FILE)
                        )
                        credential.selectedAccount = googleSignInAccount.account
                        googleDriveService = Drive.Builder(
                            transport,
                            GsonFactory(),
                            credential
                        )
                            .setApplicationName("Imary")
                            .build()
                        if (googleDriveService != null) {
                            driveHelper = DriveServiceHelper(googleDriveService!!) { aBoolean: Boolean ->
                                if (aBoolean) {
                                    BackupModule.instance.mCallBack!!.invoke(null, true)
                                } else {
                                    BackupModule.instance.mCallBack!!.invoke(null, false)
                                }
                            }
                            withContext(Dispatchers.Default){
                                driveHelper!!.clearFolder()
                            }
                            withContext(Dispatchers.Default){
                                driveHelper!!.uploadToDrive()
                            }
                        }
                    }
                }.addOnFailureListener { e -> Log.d("REGISTERED", "failed: " + e.message) }
        } catch (e: Exception) {
            // The ApiException status code indicates the detailed failure reason.
            // Please refer to the GoogleSignInStatusCodes class reference for more information.
            Log.d("TAG", "signInResult:failed code=" + e.message)
        }
    }
}