package com.elearning.marugoto.model.dto.response;
import lombok.Data;
import java.util.List;

@Data
public class KanaResponse {
    private List<GroupDTO> groups;
}
