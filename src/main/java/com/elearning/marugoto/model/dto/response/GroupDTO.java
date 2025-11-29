package com.elearning.marugoto.model.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class GroupDTO {
    private String groupName;
    private List<CharacterDTO> characters;
}
