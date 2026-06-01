package com.uniplan.service;

import com.uniplan.dto.request.LoginRequestDTO;
import com.uniplan.dto.request.RegisterRequestDTO;
import com.uniplan.dto.response.AuthResponseDTO;

public interface AuthService {

    AuthResponseDTO register(RegisterRequestDTO request);

    AuthResponseDTO login(LoginRequestDTO request);

    void logout();
}
