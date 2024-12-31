import java.io.BufferedReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

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
            String keysList = jsonObject.getString("keys");


            String[] keys = keysList.split(",");
            StringBuilder placeholders = new StringBuilder();
            for (int i = 0; i < keys.length; i++) {
                placeholders.append("?");
                if (i < keys.length - 1) {
                    placeholders.append(",");
                }
            }
           
        	dbConnection = new DatabaseConnection();
        	connection = dbConnection.getConnection();
        	if(connection == null) {
        		throw new SQLException("error");
        	}
            String sql = "SELECT itemid,title,price FROM items WHERE itemid IN (" + placeholders.toString() + ")";
              
            try{   
                stmt = connection.prepareStatement(sql);
                for (int i = 0; i < keys.length; i++) {
                    stmt.setInt(i + 1, Integer.parseInt(keys[i]));
                }
                resultSet = stmt.executeQuery();
                Map<Integer,SqlData> map = new HashMap<>();
                while(resultSet.next()) {
                    int itemid = resultSet.getInt("itemid");
                    String title = resultSet.getString("title");
                    int price = resultSet.getInt("price");
                    SqlData sqldata = new SqlData(itemid, title, price);
                    map.put(itemid, sqldata);
                }
                Gson gson = new Gson();
                String json = gson.toJson(map);

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
        private int price;
    
        SqlData(int itemid,String title,int price){
            this.itemid = itemid;
            this.title = title;
            this.price = price;
        }
    }
}
