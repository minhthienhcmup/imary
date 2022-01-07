package com.imaryproject

import android.content.Intent
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.*
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.Scope
import com.google.api.client.googleapis.extensions.android.gms.auth.GoogleAccountCredential
import com.google.api.client.http.FileContent
import com.google.api.client.http.HttpTransport
import com.google.api.client.http.javanet.NetHttpTransport
import com.google.api.client.json.gson.GsonFactory
import com.google.api.services.drive.Drive
import com.google.api.services.drive.DriveScopes
import com.google.api.services.drive.model.FileList
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.util.*


class BackupModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var account: GoogleSignInAccount? = null
    private var mGoogleSignInClient: GoogleSignInClient? = null
    private var googleDriveService: Drive? = null
    private var driveHelper : DriveServiceHelper? = null
    var mCallBack : Callback? = null

    companion object {
        const val RC_UPLOAD: Int  = 9091
        const val RC_RESTORE: Int = 8090
        lateinit var instance: BackupModule
    }

    init {
        instance = this
    }

    override fun getName(): String {
        return "BackupModule"
    }

    @ReactMethod
    fun backupServer(videosName: ReadableArray, callback: Callback) {
        mCallBack = callback
        GlobalScope.launch(Dispatchers.IO){
            try{
                withContext(Dispatchers.Default) {
                    handleLogin()
                }
//                callback.invoke(null, true)
            }catch (e : Exception){
                Log.e("ERROR",e.toString())
                callback.invoke(null, false)
            }
        }

    }

    private suspend fun handleLogin() {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestScopes(Scope(DriveScopes.DRIVE_FILE))
            .requestEmail()
            .build()
        mGoogleSignInClient = GoogleSignIn.getClient(reactApplicationContext, gso)
         account = GoogleSignIn.getLastSignedInAccount(
            reactApplicationContext
        )

        if (account != null) {
            val transport: HttpTransport = NetHttpTransport()
            val credential = GoogleAccountCredential.usingOAuth2(
                reactApplicationContext, setOf(DriveScopes.DRIVE_FILE)
            )
            credential.selectedAccount = account?.account
            googleDriveService = Drive.Builder(
                transport,
                GsonFactory(),
                credential
            )
                .setApplicationName("Imary")
                .build()
            if(googleDriveService != null){
                driveHelper = DriveServiceHelper(googleDriveService!!){ result ->
                    if(result){
                        mCallBack?.invoke(null, true)
                    }else{
                        mCallBack?.invoke(null, false)
                    }
                }
                withContext(Dispatchers.Default){
                    driveHelper!!.clearFolder()
                }
                withContext(Dispatchers.Default){
                    driveHelper!!.uploadToDrive()
                }
            }
        } else {
            requestLogin(RC_UPLOAD)
        }
    }

    @ReactMethod
    fun restoreServer(msg: String, callback: Callback) {
        mCallBack = callback
        GlobalScope.launch(Dispatchers.IO) {
            if(driveHelper != null && driveHelper?.googleDriveService != null){
                withContext(Dispatchers.Default){
                    driveHelper!!.restoreFile()
                }
            }else{
                val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                    .requestScopes(Scope(DriveScopes.DRIVE_FILE))
                    .requestEmail()
                    .build()
                mGoogleSignInClient = GoogleSignIn.getClient(reactApplicationContext, gso)
                account = GoogleSignIn.getLastSignedInAccount(
                    reactApplicationContext
                )
                if (account != null) {
                    val transport: HttpTransport = NetHttpTransport()
                    val credential = GoogleAccountCredential.usingOAuth2(
                        reactApplicationContext, setOf(DriveScopes.DRIVE_FILE)
                    )
                    credential.selectedAccount = account?.account
                    googleDriveService = Drive.Builder(
                        transport,
                        GsonFactory(),
                        credential
                    )
                        .setApplicationName("Imary")
                        .build()
                    if(googleDriveService != null){
                        driveHelper = DriveServiceHelper(googleDriveService!!){ result ->
                            if(result){
                                mCallBack?.invoke(null, true)
                            }else{
                                mCallBack?.invoke(null, false)
                            }
                        }
                        withContext(Dispatchers.Default){
                            driveHelper!!.restoreFile()
                        }
                    }
                } else {
                    requestLogin(RC_RESTORE)
                }
            }
        }
    }

    private fun requestLogin(code: Int) {
        val intent: Intent? = mGoogleSignInClient?.signInIntent
        this.reactApplicationContext.startActivityForResult(
            intent,
            code,
            null
        )
    }
}