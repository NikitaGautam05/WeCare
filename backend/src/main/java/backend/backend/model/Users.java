package backend.backend.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection="login")
public class Users {
    @Id
    private String id;
    private String userName;
    private String password;

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

//    public String getPhoto() {
//        return photo;
//    }

//    public void setPhoto(String photo) {
//        this.photo = photo;
//    }

    private String confirmPassword;
//    private String photo;
    private String email;
    private String role;


    public List<String> getFavourites() {
        return favourites;
    }

    public void setFavourites(List<String> favourites) {
        this.favourites = favourites;
    }

    public List<HistoryItems> getHistory() {
        return history;
    }

    public void setHistory(List<HistoryItems> history) {
        this.history = history;
    }

    private List<String > favourites =new ArrayList<>();
    private List<HistoryItems> history = new ArrayList<>();

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }


    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }


}
