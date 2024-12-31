import java.io.BufferedReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.naming.NamingException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

@WebServlet("/EditProduct")
public class EditProductServlet extends HttpServlet{
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("text/plain;charset=UTF-8");
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
            String title = jsonObject.getString("title");
            String price = jsonObject.getString("price");
            String category = jsonObject.getString("category");
            String unit = jsonObject.getString("unit");
            String pic = jsonObject.getString("pic");

        	dbConnection = new DatabaseConnection();
        	connection = dbConnection.getConnection();
        	if(connection == null) {
        		throw new SQLException("error");
        	}

            String sql = "UPDATE items SET title = ? ,price = ? ,cid= ?,unit= ?,state = 0 WHERE itemid = ?";                      
              
            try{   
                stmt = connection.prepareStatement(sql);                
                stmt.setString(1, title);    
                stmt.setString(2, price);  
                stmt.setString(3, category);    
                stmt.setString(4, unit); 
                stmt.setString(5, itemid); 
                stmt.executeUpdate();

                if(!pic.equals("nochange")){
                    sql = "UPDATE items SET pic = ? WHERE itemid = ?";
                    stmt = connection.prepareStatement(sql);                
                    stmt.setString(1, pic);    
                    stmt.setString(2, itemid);
                    stmt.executeUpdate();
                }
                resp.getWriter().write("edited");                
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
}

