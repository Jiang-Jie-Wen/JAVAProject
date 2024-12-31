import javax.naming.*;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

public class DatabaseConnection {
	
	private DataSource dataSource;
	
	public DatabaseConnection() throws NamingException {
        Context context = new InitialContext();
        this.dataSource = (DataSource) context.lookup("java:/comp/env/jdbc/mariadb");
    }
	
	public Connection getConnection() throws SQLException {
        if (dataSource != null) {
            return dataSource.getConnection();
        }
        throw new SQLException("DataSource is not initialized.");
    }
}