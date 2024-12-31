import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

import java.io.*;
import java.util.*;

@WebServlet("/UpdateFile")
public class UpdateFileServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        
        String tomcatHome = System.getProperty("catalina.home"); // 獲取 Tomcat 安裝根目錄
        String uploadPath = tomcatHome + "/webapps/picture";
        
        DiskFileItemFactory factory = new DiskFileItemFactory();
        ServletFileUpload upload = new ServletFileUpload(factory);
        upload.setFileSizeMax(50 * 1024 * 1024);  // 設定最大檔案大小（50 MB）

        try {
            List<FileItem> formItems = upload.parseRequest(request);  
            if (formItems != null && formItems.size() > 0) {
                for (FileItem item : formItems) {
                    if (!item.isFormField()) {
                        String mimeType = item.getContentType();
                        String newFileName = "File_" + System.currentTimeMillis() + getFileExtension(mimeType);

                        String filePath = uploadPath + File.separator + newFileName;
                        File storeFile = new File(filePath);
                        item.write(storeFile);  

                        response.setContentType("application/json");
                        response.getWriter().write("{\"fileName\": \"" + newFileName + "\"}");
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().write("{\"status\": \"error\", \"message\": \"File upload failed!\"}");
        }
    }

    private String getFileExtension(String mimeType) {
        if ("image/png".equalsIgnoreCase(mimeType)) {
            return ".png";
        } else if ("image/jpeg".equalsIgnoreCase(mimeType)) {
            return ".jpg";
        }
        return "";
    }
}

