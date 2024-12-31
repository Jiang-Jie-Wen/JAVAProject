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

@WebServlet("/Login")
public class LoginServlet extends HttpServlet{
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("text/plain;charset=UTF-8");
        try {
            BufferedReader reader = req.getReader();
            StringBuilder jsonStr = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                jsonStr.append(line);
            }

            JSONObject jsonObject = new JSONObject(jsonStr.toString());
            String account = jsonObject.getString("account");
            String password = jsonObject.getString("password");

        	DatabaseConnection dbConnection = new DatabaseConnection();
        	Connection connection = dbConnection.getConnection();
        	if(connection == null) {
        		throw new SQLException("error");
        	}
       
            String sql = "SELECT aid,passwd FROM admins WHERE account = ?";            
            
            try(PreparedStatement stmt = connection.prepareStatement(sql)){   
                stmt.setString(1, account);    
                ResultSet resultSet = stmt.executeQuery();
                if(!resultSet.isBeforeFirst()){
                    resp.getWriter().write("noadmin");
                    return;
                }else{
                    while (resultSet.next()){
                        if(password.equals(resultSet.getString("passwd"))){                            
                            HttpSession session = req.getSession();
                            session.setAttribute("AdminIsLogin", resultSet.getInt("aid"));
                            resp.getWriter().write("correct");
                            return;
                        }
                    }
                    resp.getWriter().write("PwdError");
                    return;
                }
                
            }catch(Exception e) {
            	e.printStackTrace();
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return;
        } catch (NamingException e) {
			e.printStackTrace();
		}
    }    

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doGet(req, resp);
    }
}
