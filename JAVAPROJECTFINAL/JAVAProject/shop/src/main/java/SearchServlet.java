
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

@WebServlet("/Search")
public class SearchServlet extends HttpServlet{
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
            String commdity = jsonObject.getString("commdity");
            String sortby = jsonObject.getString("sortby");
            String searchs = jsonObject.getString("searchs");
            String page = jsonObject.getString("page");

        	dbConnection = new DatabaseConnection();
        	connection = dbConnection.getConnection();
        	if(connection == null) {
        		throw new SQLException("error");
        	}
    
            String sql = "SELECT itemid,categories.title as category,items.title as title,price,pic FROM items inner join categories USING(cid) WHERE state = 2 AND items.title LIKE ?";      
            if(!commdity.equals("0")){
                sql += " AND cid = " + commdity;
            }

            if(sortby.equals("new")){
                sql += " ORDER BY itemid DESC";
            }else if(sortby.equals("old")){
                sql += " ORDER BY itemid ASC";
            }else if(sortby.equals("high")){
                sql += " ORDER BY price DESC";
            }else if(sortby.equals("low")){
                sql += " ORDER BY price ASC";
            }

            sql += " LIMIT ?,12";
              
            try{   
                stmt = connection.prepareStatement(sql);
                String searchTitle = "%" + searchs + "%";
                stmt.setString(1, searchTitle);    
                stmt.setInt(2, (Integer.parseInt(page)-1) * 12);    
                resultSet = stmt.executeQuery();
                
                ArrayList<SqlData> arrayList = new ArrayList<>();
                while(resultSet.next()) {
                    int itemid = resultSet.getInt("itemid");
                    String category = resultSet.getString("category");
                    String title = resultSet.getString("title");
                    String price = resultSet.getString("price");
                    String pic  = resultSet.getString("pic");
                    SqlData sqldata = new SqlData(itemid, category, title,price,pic);
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
        private int itemid;
        private String category;
        private String title;
        private String price;
        private String pic;
    
        SqlData(int itemid,String category,String title,String price,String pic){
            this.itemid = itemid;
            this.category = category;
            this.title = title;
            this.price = price;
            this.pic = pic;
        }
    }
}

