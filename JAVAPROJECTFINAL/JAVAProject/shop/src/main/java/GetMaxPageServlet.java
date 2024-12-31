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

@WebServlet("/GetMaxPage")
public class GetMaxPageServlet extends HttpServlet{
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
            String commdity = jsonObject.getString("commdity");
            String searchs = jsonObject.getString("searchs");

        	dbConnection = new DatabaseConnection();
        	connection = dbConnection.getConnection();
        	if(connection == null) {
        		throw new SQLException("error");
        	}

            String sql = "SELECT Count(*) as nums FROM items WHERE state = 2 AND title LIKE ?";      
            if(!commdity.equals("0")){
                sql += " AND cid = " + commdity;
            }
              
            try{   
                stmt = connection.prepareStatement(sql);
                String searchTitle = "%" + searchs + "%";
                stmt.setString(1, searchTitle);    
                resultSet = stmt.executeQuery();
                int nums = 0;
                if(resultSet.next()){
                    nums = resultSet.getInt("nums");
                }
                

                resp.getWriter().write(String.valueOf(nums));        
                
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

