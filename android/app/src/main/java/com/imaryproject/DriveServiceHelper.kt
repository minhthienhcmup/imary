package com.imaryproject

import android.util.Log
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.api.client.http.FileContent
import com.google.api.services.drive.Drive
import com.google.api.services.drive.model.FileList
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream
import java.util.*
import javax.security.auth.callback.Callback

class DriveServiceHelper(drive: Drive, callBack: ((status: Boolean)-> Unit)) {
    var googleDriveService: Drive? = null
    private var listener: ((status: Boolean)->Unit)? = null
    private var folderId: String? = null
    init {
        googleDriveService = drive
        listener = callBack
    }

    suspend fun clearFolder() {
        var pageToken: String? = null
        do {
            val result: FileList? = getFolder(pageToken)
//            Log.d("TAGFILELIST", "result: " + result?.files?.get(0)?.id)
            if(result != null && result?.files.isNotEmpty()){
                withContext(Dispatchers.Default){
                    googleDriveService?.files()?.delete(result?.files?.get(0)?.id)?.execute()
                }
            }
            pageToken = result?.nextPageToken
        } while (pageToken != null)
    }
    private suspend fun getFolder(pageToken: String?): FileList? {
        var result: FileList?
        withContext(Dispatchers.Default) {
            result = googleDriveService?.files()?.list()
                ?.setQ("mimeType = 'application/vnd.google-apps.folder' and name = 'Imary'")
                ?.setSpaces("drive")
                ?.setFields("nextPageToken, files(id, name, modifiedTime, size, createdTime, parents, appProperties)")
                ?.setPageToken(pageToken)
                ?.execute()
        }
        Log.d("TAGFILELIST", "result: $result")

        return result
    }

    suspend fun uploadToDrive() {

        // GET ALL FILE NAME IN LOCAL STORAGE//
        val path = File("/storage/emulated/0/Android/data/com.imaryproject/files/Pictures/")
        val list = path.listFiles()
        val myList = ArrayList<String>()
        for (i in list.indices) {
            myList.add(list[i].name)
        }
        for (i in myList.indices) {
            Log.d("FILENAME", myList[i])
        }
        try {
            // crate imary folder
            val folderId :String = withContext(Dispatchers.Default){
                createFolder()
            }
            // upload video
            for((index,file) in myList.withIndex()){
                withContext(Dispatchers.Default){
                    val fileMetadata = com.google.api.services.drive.model.File()
                    fileMetadata.name = file
                    fileMetadata.parents = Collections.singletonList(folderId)
                    val filePath = list[index]
                    val mediaContent = FileContent("video/mp4", filePath)
                    val file = googleDriveService?.files()?.create(fileMetadata, mediaContent)?.setFields("id, parents")?.execute()
                }
            }
            //upload default.realm
            withContext(Dispatchers.Default){
                val realmPath = File("/data/data/com.imaryproject/files/default.realm")
                val fileMetadata = com.google.api.services.drive.model.File()
                fileMetadata.name="default.realm"
                fileMetadata.parents = Collections.singletonList(folderId)
                val realmContent = FileContent("*/*", realmPath)
                val file = googleDriveService?.files()?.create(fileMetadata, realmContent)?.setFields("id, parents")?.execute()
            }
            listener?.invoke(true)
        } catch (e: Exception) {
            Log.d("FILE ERROR", e.toString())
            listener?.invoke(false)
        }
    }

    private fun createFolder(): String{
        return try {
            val folderMetadata = com.google.api.services.drive.model.File()
            folderMetadata.name = "Imary"
            folderMetadata.mimeType = "application/vnd.google-apps.folder"
            googleDriveService!!.files().create(folderMetadata).setFields("id").execute().id
        } catch (e: Exception) {
            Log.d("FILE ERROR", e.toString())
            listener?.invoke(false)
            ""
        }
    }

    private suspend fun getFile(queryString: String): FileList?{
        var result: FileList?
        withContext(Dispatchers.Default) {
            result = googleDriveService?.files()?.list()
                ?.setQ(queryString)
                ?.setSpaces("drive")
                ?.setFields("nextPageToken, files(id, name, modifiedTime, size, createdTime, parents, appProperties)")
//                ?.setPageToken(pageToken)
                ?.execute()
        }
        Log.d("TAGFILELIST", "result: $result")
        return result
    }


    suspend fun restoreFile() {
        //CHECK DIRETORY
        var folder = File("/storage/emulated/0/Android/data/com.imaryproject/files/Pictures/")
        if(!folder.exists()){
            folder.mkdirs()
        }
        var pageToken: String? = null
        //FIND FOLDER ID
        do {
            val result: FileList? = getFolder(pageToken)
            if(result != null && result?.files.isNotEmpty()){
                withContext(Dispatchers.Default){
                    folderId = result?.files?.get(0)?.id
                }
                break
            }
            pageToken = result?.nextPageToken
        } while (pageToken != null)
        val fileInFolder: FileList?
        withContext(Dispatchers.Default){
            fileInFolder = getFile("mimeType = 'video/mp4' and '$folderId' in parents")
        }
        Log.d("FILE", fileInFolder?.files?.isEmpty().toString());
        for(file in fileInFolder?.files!!){
            downLoadFile(file, "/storage/emulated/0/Android/data/com.imaryproject/files/Pictures/")
        }
        val realmInFolder: FileList? = getFile("mimeType = '*/*' and '$folderId' in parents")
        downLoadFile(realmInFolder?.files?.get(0), "/data/data/com.imaryproject/files/")
        BackupModule.instance.mCallBack?.invoke(null, true)
    }

    private suspend fun downLoadFile(file: com.google.api.services.drive.model.File? , path: String){
     try{
         var pathFile = "$path${file?.name}"
         var newFile = File(pathFile)
         var outputStream: OutputStream = FileOutputStream(newFile)
         withContext(Dispatchers.Default){
             googleDriveService?.files()?.get(file?.id)?.executeMediaAndDownloadTo(outputStream)
         }
         Log.d("WRITE", "WRITE FILE SUCCESSFUL")
         outputStream.close()
     }catch (e: Exception){
         BackupModule.instance.mCallBack?.invoke(null, false)
     }
    }
}