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
import javax.servlet.http.HttpSession;

import org.json.JSONObject;

@WebServlet("/AddAdminServlet")
public class AddAdminServlet extends HttpServlet{
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {        
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
            String account = jsonObject.getString("account");
            String passwd = jsonObject.getString("password");

            dbConnection = new DatabaseConnection();
        	connection = dbConnection.getConnection();
        	if(connection == null) {
        		throw new SQLException("error");
        	}

            String sql = "SELECT aid as total FROM admins WHERE account = ?"; 
            stmt = connection.prepareStatement(sql);
            stmt.setString(1, account);    
            resultSet = stmt.executeQuery();
            if(resultSet.isBeforeFirst()){
                resp.getWriter().write("Registered");
                return;
            }         

            HttpSession session = req.getSession();            
                
            sql = "INSERT INTO admins(account, passwd, createby) VALUES (?,?,?)";
            stmt = connection.prepareStatement(sql);
            stmt.setString(1, account);
            stmt.setString(2, passwd);
            stmt.setInt(3, (int)session.getAttribute("AdminIsLogin"));
            stmt.executeUpdate();
            resp.getWriter().write("correct");
            
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
}

