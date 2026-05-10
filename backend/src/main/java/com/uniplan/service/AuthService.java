package com.uniplan.service;

import com.uniplan.dto.request.LoginRequestDTO;
import com.uniplan.dto.request.RegisterRequestDTO;
import com.uniplan.dto.response.AuthResponseDTO;
import com.uniplan.dto.response.UserResponseDTO;

public interface AuthService {

    UserResponseDTO register(RegisterRequestDTO request);

    AuthResponseDTO login(LoginRequestDTO request);

    void logout();
}
