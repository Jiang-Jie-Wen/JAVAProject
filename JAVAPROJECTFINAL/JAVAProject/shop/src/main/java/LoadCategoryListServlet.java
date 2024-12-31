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

import com.google.gson.Gson;

@WebServlet("/LoadCategoryList")
public class LoadCategoryListServlet extends HttpServlet{
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json;charset=UTF-8");
        DatabaseConnection dbConnection = null;
        Connection connection = null;
        PreparedStatement stmt = null;
        ResultSet resultSet = null;
        try {
        	dbConnection = new DatabaseConnection();
        	connection = dbConnection.getConnection();
        	if(connection == null) {
        		throw new SQLException("error");
        	}

            String sql = "SELECT * FROM categories";            
              
            try{   
                stmt = connection.prepareStatement(sql);
                resultSet = stmt.executeQuery();
                ArrayList<SqlData> arrayList = new ArrayList<>();
                while(resultSet.next()) {
                    int id = resultSet.getInt("cid");
                    String title = resultSet.getString("title");
                    SqlData sqldata = new SqlData(id, title);
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
        private int id;
        private String title;
    
        SqlData(int id,String title){
            this.id = id;
            this.title = title;
        }
    }
}

