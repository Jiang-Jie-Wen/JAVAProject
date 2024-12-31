import java.io.BufferedReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;

import javax.naming.NamingException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.google.gson.Gson;

@WebServlet("/LoadAllProducts")
public class LoadAllProductsServlet extends HttpServlet{
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");
        DatabaseConnection dbConnection = null;
        Connection connection = null;
        PreparedStatement stmt = null;
        ResultSet resultSet = null;
        try {
            BufferedReader reader = req.getReader();
            StringBuilder jsonStr = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                jsonStr.append(line);
            }
            JSONObject jsonObject = new JSONObject(jsonStr.toString());
            String userId = jsonObject.getString("userId");
            dbConnection = new DatabaseConnection();
        	connection = dbConnection.getConnection();
        	if(connection == null) {
        		throw new SQLException("error");
        	}

            String sql = "SELECT itemid,title,pic,state FROM items WHERE uid = ?";            
              
            try{   
                stmt = connection.prepareStatement(sql);
                stmt.setString(1, userId);    
                resultSet = stmt.executeQuery();
                ArrayList<SqlData> arrayList = new ArrayList<>();
                while(resultSet.next()) {
                    int itemid = resultSet.getInt("itemid");
                    String title = resultSet.getString("title");
                    String pic = resultSet.getString("pic");
                    int state = resultSet.getInt("state");
                    SqlData sqldata = new SqlData(itemid, title,pic,state);
                    arrayList.add(sqldata);
                }

                Gson gson = new Gson();
                String json = gson.toJson(arrayList);

                resp.getWriter().write(json);
                
            }catch(Exception e) {
            	e.printStackTrace();
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return;
        } catch (NamingException e) {
			e.printStackTrace();
		} finally {            
            try {
                if (resultSet != null) resultSet.close();
                if (stmt != null) stmt.close();
                if (connection != null) connection.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }    

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doGet(req, resp);
    }

    @SuppressWarnings("unused")
    private class SqlData{
        private int itemid;
        private String title;
        private String pic;
        private int state;

    
        SqlData(int itemid,String title,String pic,int state){
            this.itemid = itemid;
            this.title = title;
            this.pic = pic;
            this.state = state;
        }
    }
}
