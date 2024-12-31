import java.io.BufferedReader;
import java.io.IOException;
import java.lang.reflect.Type;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Map;

import javax.naming.NamingException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

@WebServlet("/SubmitOrder")
public class SubmitOrderServlet extends HttpServlet{
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("text/plain;charset=UTF-8");  
        DatabaseConnection dbConnection = null;
        Connection connection = null;
        PreparedStatement stmt = null;
        ResultSet resultSet = null;
        try {
            //
            BufferedReader reader = req.getReader();
            StringBuilder jsonStr = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                jsonStr.append(line);
            }

            JSONObject jsonObject = new JSONObject(jsonStr.toString());
            
            String name = jsonObject.getString("name");
            String address = jsonObject.getString("address");
            String phone = jsonObject.getString("phone");
            String user = jsonObject.getString("user");
            String cart = jsonObject.getString("cart");            
            
            Gson gson = new Gson();
            Type type = new TypeToken<Map<String, Map<String, Integer>>>(){}.getType();
            Map<String, Map<String, Integer>> cartMap = gson.fromJson(cart, type);
            String[] itemIds = cartMap.keySet().toArray(new String[0]);
            StringBuilder placeholders = new StringBuilder();
            for (int i = 0; i < itemIds.length; i++) {
                placeholders.append("?");
                if (i < itemIds.length - 1) {
                    placeholders.append(",");
                }
            }
            dbConnection = new DatabaseConnection();
            connection = dbConnection.getConnection();
            if(connection == null) {
                throw new SQLException("error");
            }

            String sql = "SELECT DISTINCT uid FROM items WHERE itemid IN (" + placeholders.toString() + ")";
            stmt = connection.prepareStatement(sql);
            for (int i = 0; i < itemIds.length; i++) {
                stmt.setInt(i + 1, Integer.parseInt(itemIds[i]));
            }
            resultSet = stmt.executeQuery();
            ArrayList<Integer> seller = new ArrayList<>();
            while(resultSet.next()) {
                int uid = resultSet.getInt("uid");
                seller.add(uid);
            }
            for(int sid : seller){
                sql = "INSERT INTO orders (uid, sid, name, phone, address) VALUES (?, ?, ? , ? , ?);";
                stmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                stmt.setString(1, user);
                stmt.setInt(2, sid);
                stmt.setString(3, name);
                stmt.setString(4, phone);
                stmt.setString(5, address);
                int affectedRows = stmt.executeUpdate();

                if (affectedRows > 0) {
                    ResultSet generatedKeys = stmt.getGeneratedKeys();
                    if (generatedKeys.next()) {
                        int oid = generatedKeys.getInt(1);
                        sql = "SELECT itemid,price FROM items WHERE uid = ? AND itemid IN (" + placeholders.toString() + ")";
                        stmt = connection.prepareStatement(sql);
                        stmt.setInt(1, sid);
                        for (int i = 0; i < itemIds.length; i++) {
                            stmt.setInt(i + 2, Integer.parseInt(itemIds[i]));
                        }
                        resultSet = stmt.executeQuery();
                        ArrayList<Integer> getitemids = new ArrayList<>();
                        ArrayList<Integer> getprices = new ArrayList<>();
                        while(resultSet.next()) {
                            int getitemid = resultSet.getInt("itemid");
                            int getprice = resultSet.getInt("price");
                            getitemids.add(getitemid);
                            getprices.add(getprice);
                        }
                        sql = "INSERT INTO orderdetails (oid, itemid, qty, price) VALUES (?, ?, ? , ?);";
                        for (int i = 0; i < getitemids.size(); i++) {
                            stmt = connection.prepareStatement(sql);
                            stmt.setInt(1,oid);
                            stmt.setInt(2,getitemids.get(i));
                            stmt.setInt(3,cartMap.get(String.valueOf(getitemids.get(i))).get("qty"));
                            stmt.setInt(4,getprices.get(i));
                            stmt.executeUpdate();
                        }
                        
                    }
                }
            }

            
            resp.getWriter().write("ok");
        } catch (NamingException e) {
            e.printStackTrace();
        } catch (SQLException e) {
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