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

@WebServlet("/LoadProductDetails")
public class LoadProductDetailsServlet extends HttpServlet{
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
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
            String itemid = jsonObject.getString("itemid");

        	dbConnection = new DatabaseConnection();
        	connection = dbConnection.getConnection();
        	if(connection == null) {
        		throw new SQLException("error");
        	}

            String sql = "SELECT title,price,unit,state,cid FROM items  WHERE itemid = ?";            
                    
              
            try{   
                stmt = connection.prepareStatement(sql);
                stmt.setString(1, itemid);    
                resultSet = stmt.executeQuery();
                ArrayList<SqlData> arrayList = new ArrayList<>();
                while(resultSet.next()){                     
                    String title = resultSet.getString("title");  
                    int price = resultSet.getInt("price");  
                    String unit = resultSet.getString("unit");  
                    String state = resultSet.getString("state");  
                    int cid = resultSet.getInt("cid");  
                    SqlData sqldata = new SqlData(title,price,unit,state,cid);
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
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doPost(req, resp);
    }

    @SuppressWarnings("unused")
    private class SqlData{
        private String title;
        private int price;
        private String unit;
        private String state;
        private int cid;
    
        SqlData(String title,int price,String unit,String state,int cid){
            this.title = title;
            this.price = price;
            this.unit = unit;
            this.state = state;
            this.cid = cid;
        }
    }
}
